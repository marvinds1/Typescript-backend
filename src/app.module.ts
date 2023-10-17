import { Module } from '@nestjs/common';
import { AuthenticationModule } from './authentication/authentication.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { TripModule } from './trip/trip.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    AuthenticationModule,
    TripModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
