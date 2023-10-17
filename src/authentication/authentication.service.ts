import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  async authenticate(authenticateUserDto: AuthenticateUserDto) {
    const { email, password } = authenticateUserDto;
    const user = await this.userModel.findOne({ email: email });
    if (!user) {
      throw new UnauthorizedException('invalid credentials... -email');
    }
    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('invalid credentials... -password');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...restOfUserDataNoPass } = user.toJSON();

    return {
      user: restOfUserDataNoPass,
      token: this.jwtService.sign({ user }),
    };
  }

  async unAuthenticate() {
    return {
      message: 'user has been unauthenticated...',
    };
  }

  async register(registerUserDto: UserDto) {
    const encryptPassword = bcrypt.hashSync(registerUserDto.password, 8);
    registerUserDto.password = encryptPassword;
    const newUser = new this.userModel(registerUserDto);
    const uniqueId = await this.userModel.countDocuments();
    newUser._id = (uniqueId + 1).toString();
    await newUser.save();

    return {
      user: newUser,
      token: this.jwtService.sign({ newUser }),
    };
  }

  async registerAdmin(registerUserDto: UserDto) {
    const encryptPassword = bcrypt.hashSync(registerUserDto.password, 8);
    registerUserDto.password = encryptPassword;
    const newUser = new this.userModel(registerUserDto);
    const uniqueId = await this.userModel.countDocuments();
    newUser._id = (uniqueId + 1).toString();
    newUser.isAdmin = true;
    await newUser.save();

    return {
      user: newUser,
      token: this.jwtService.sign({ newUser }),
    };
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(id: string) {
    const user = await this.userModel.findById(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...restOfInfo } = user.toJSON();
    return restOfInfo;
  }

  findOne(id: number) {
    return `This action returns a #${id} authentication`;
  }

  async update(id: number, updateUserDto: UpdateAuthenticationDto) {
    const { name, password } = updateUserDto;
    const user = await this.userModel.findById(id);
    if (name == user.name) {
      throw new UnauthorizedException('invalid credentials... -name');
    }
    if (password == user.password) {
      throw new UnauthorizedException('invalid credentials... -password');
    }
    const encryptPassword = bcrypt.hashSync(user.password, 8);
    user.password = encryptPassword;
    user.name = name;
    await user.save();
    return {
      user: user,
      token: this.jwtService.sign({ user }),
    };
  }

  async remove(id: string) {
    try {
      const result = await this.userModel.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        return {
          message: 'User has been deleted',
        };
      } else {
        return {
          message: 'User not found',
        };
      }
    } catch (error) {
      if (error.name === 'CastError') {
        return {
          message: 'Invalid user ID format',
        };
      } else {
        return {
          message: 'An error occurred while deleting the user',
        };
      }
    }
  }
}
