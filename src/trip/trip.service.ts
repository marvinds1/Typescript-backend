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
    const uniqueId = await this.trip.countDocuments();
    const newTrip = new this.trip(createTripDto);
    newTrip._id = (uniqueId + 1).toString();
    newTrip.save();

    return newTrip;
  }

  async findAll() {
    const trips = await this.trip.find();
    return trips;
  }

  async findByUser(id: number) {
    const trips = await this.trip.find({ idUser: id });
    return trips;
  }

  async findOne(id: number) {
    const trip = await this.trip.findOne({ _id: id });
    return trip;
  }

  async update(id: number, updateTripDto: UpdateTripDto) {
    const { price, description, destinasiPerjalanan } = updateTripDto;
    const updateTrip = await this.trip.findOne({ where: { id } });
    if (!updateTrip) {
      throw new BadRequestException('Trip not found');
    }
    updateTrip.price = price;
    updateTrip.description = description;
    updateTrip.destinasiPerjalanan = destinasiPerjalanan;
    updateTrip.updatedAt = new Date();
    updateTrip.save();
    return updateTrip;
  }

  remove(id: number) {
    return this.trip.findOneAndRemove({ where: { id } });
  }
}
