import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { Trip } from '../trip/entities/trip.entity';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

const BCRYPT_COST = 12;
const DUMMY_HASH = bcrypt.hashSync('timing-equalizer', 10);

type PublicUser = Omit<User, 'password'>;

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,
    private readonly jwtService: JwtService,
  ) {}

  private sign(user: Pick<User, '_id' | 'isAdmin'>) {
    return this.jwtService.sign({ sub: user._id, isAdmin: user.isAdmin });
  }

  private toPublic(doc: { toObject(): User }): PublicUser {
    const { password: _password, ...rest } = doc.toObject();
    return rest;
  }

  async authenticate({ email, password }: AuthenticateUserDto) {
    const user = await this.userModel
      .findOne({ email, isActive: true })
      .select('+password');
    const valid = await bcrypt.compare(password, user?.password ?? DUMMY_HASH);
    if (!user || !valid) throw new UnauthorizedException('Invalid credentials');
    return { user: this.toPublic(user), token: this.sign(user) };
  }

  async createUser(dto: UserDto, isAdmin = false) {
    const password = await bcrypt.hash(dto.password, BCRYPT_COST);
    try {
      const user = await this.userModel.create({ ...dto, password, isAdmin });
      return { user: this.toPublic(user) };
    } catch (err) {
      if ((err as { code?: number })?.code === 11000)
        throw new ConflictException('Email already registered');
      throw err;
    }
  }

  findAll(limit = 50, skip = 0) {
    return this.userModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.min(limit, 200))
      .lean();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id).lean();
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    const update: Partial<User> = { ...dto };
    if (dto.password)
      update.password = await bcrypt.hash(dto.password, BCRYPT_COST);
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true },
    );
    if (!user) throw new NotFoundException('User not found');
    return { user: this.toPublic(user) };
  }

  async remove(id: string) {
    const result = await this.userModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('User not found');
    const { deletedCount } = await this.tripModel.deleteMany({ idUser: id });
    return { message: `User has been deleted with ${deletedCount} trip(s)` };
  }
}
