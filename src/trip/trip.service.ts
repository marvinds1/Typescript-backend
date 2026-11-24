import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../authentication/entities/user.entity';
import { AuthUser } from '../authentication/guards/auth.guard';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';

@Injectable()
export class TripService {
  constructor(
    @InjectModel(Trip.name) private readonly tripModel: Model<Trip>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private assertDateRange(start?: Date, end?: Date) {
    if (start && end && start > end) {
      throw new BadRequestException('Start date must be before end date');
    }
  }

  async create(dto: CreateTripDto) {
    this.assertDateRange(
      dto.tanggalMulaiPerjalanan,
      dto.tanggalBerakhirPerjalanan,
    );
    if (!(await this.userModel.exists({ _id: dto.idUser }))) {
      throw new BadRequestException('idUser does not exist');
    }
    return this.tripModel.create(dto);
  }

  findAll(limit = 50, skip = 0) {
    return this.tripModel
      .find()
      .sort({ tanggalMulaiPerjalanan: -1 })
      .skip(skip)
      .limit(Math.min(limit, 200))
      .lean();
  }

  findByUser(idUser: string) {
    return this.tripModel
      .find({ idUser })
      .sort({ tanggalMulaiPerjalanan: -1 })
      .lean();
  }

  async findOne(id: string, requester: AuthUser) {
    const filter = requester.isAdmin
      ? { _id: id }
      : { _id: id, idUser: requester.id };
    const trip = await this.tripModel.findOne(filter).lean();
    if (!trip) throw new NotFoundException('Trip not found');
    return trip;
  }

  async update(id: string, dto: UpdateTripDto) {
    const current = await this.tripModel.findById(id).lean();
    if (!current) throw new NotFoundException('Trip not found');
    this.assertDateRange(
      dto.tanggalMulaiPerjalanan ?? current.tanggalMulaiPerjalanan,
      dto.tanggalBerakhirPerjalanan ?? current.tanggalBerakhirPerjalanan,
    );
    if (dto.idUser && !(await this.userModel.exists({ _id: dto.idUser }))) {
      throw new BadRequestException('idUser does not exist');
    }
    const updated = await this.tripModel
      .findOneAndUpdate(
        { _id: id, updatedAt: current['updatedAt'] },
        { $set: dto },
        { new: true, runValidators: true },
      )
      .lean();
    if (!updated)
      throw new ConflictException(
        'Trip was modified concurrently, please retry',
      );
    return updated;
  }

  async remove(id: string) {
    const result = await this.tripModel.deleteOne({ _id: id });
    if (result.deletedCount === 0)
      throw new NotFoundException('Trip not found');
    return { message: 'Trip has been deleted' };
  }
}
