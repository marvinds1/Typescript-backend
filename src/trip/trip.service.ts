import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { Trip } from './entities/trip.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TripService {
  constructor(@InjectModel(Trip.name) private trip: Model<Trip>) {}

  async create(createTripDto: CreateTripDto) {
    const { tanggalMulaiPerjalanan, tanggalBerakhirPerjalanan } = createTripDto;

    if (tanggalMulaiPerjalanan > tanggalBerakhirPerjalanan) {
      throw new BadRequestException('Start date must be before end date');
    }
    const newTrip = new this.trip(createTripDto);
    const uniqueId = Date.now();
    const uniqueId2 = await this.trip.countDocuments();
    newTrip._id = (uniqueId + uniqueId2).toString();
    newTrip.save();

    return newTrip;
  }

  async findAll() {
    const trips = await this.trip.find();
    return trips;
  }

  async findByUser(id: string) {
    const trips = await this.trip.find({ idUser: id });
    return trips;
  }

  async findOne(id: string) {
    try {
      const result = await this.trip.findOne({ _id: id });
      if (!result) {
        throw new BadRequestException('Trip not found');
      }
      return result;
    } catch (error) {
      return error;
    }
  }

  async update(updateTripDto: UpdateTripDto, id: string) {
    const {
      price,
      description,
      destinasiPerjalanan,
      idUser,
      tanggalMulaiPerjalanan,
      tanggalBerakhirPerjalanan,
    } = updateTripDto;
    const updateTrip = await this.trip.findOne({ _id: id });
    if (!updateTrip) {
      throw new BadRequestException('Trip not found');
    }
    updateTrip.idUser = idUser;
    updateTrip.tanggalMulaiPerjalanan = tanggalMulaiPerjalanan;
    updateTrip.tanggalBerakhirPerjalanan = tanggalBerakhirPerjalanan;
    updateTrip.price = price;
    updateTrip.description = description;
    updateTrip.destinasiPerjalanan = destinasiPerjalanan;
    updateTrip.updatedAt = new Date();
    updateTrip.save();
    return updateTrip;
  }

  async remove(id: string) {
    try {
      const result = await this.trip.deleteOne({ _id: id });
      if (result.deletedCount === 1) {
        return {
          message: 'Trip has been deleted',
        };
      } else {
        return {
          message: 'Trip not found',
        };
      }
    } catch (error) {
      return error;
    }
  }
}
