import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';
import { User, UserSchema } from './entities/user.entity';
import { Trip, TripSchema } from '../trip/entities/trip.entity';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Trip.name, schema: TripSchema },
    ]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SEED');
        if (secret.length < 32)
          throw new Error('JWT_SEED must be at least 32 characters');
        return { secret, signOptions: { expiresIn: '2h', algorithm: 'HS256' } };
      },
    }),
  ],
  controllers: [AuthenticationController],
  providers: [AuthenticationService, AuthGuard, AdminGuard],
  exports: [AuthGuard, AdminGuard, MongooseModule],
})
export class AuthenticationModule {}
