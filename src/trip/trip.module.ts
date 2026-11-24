import { Module } from '@nestjs/common';
import { AuthenticationModule } from '../authentication/authentication.module';
import { TripController } from './trip.controller';
import { TripService } from './trip.service';

@Module({
  imports: [AuthenticationModule],
  controllers: [TripController],
  providers: [TripService],
})
export class TripModule {}
