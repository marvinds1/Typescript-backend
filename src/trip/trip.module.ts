import { Module } from '@nestjs/common';
import { TripService } from './trip.service';
import { TripController } from './trip.controller';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Trip, TripSchema } from './entities/trip.entity';

@Module({
  controllers: [TripController],
  providers: [TripService],
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forFeature([
      {
        name: Trip.name,
        schema: TripSchema,
      },
    ]),
  ],
})
export class TripModule {}
