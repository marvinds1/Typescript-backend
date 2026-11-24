import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { User } from '../entities/user.entity';

export interface AuthUser {
  id: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthUser }>();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) throw new UnauthorizedException();

    let payload: { sub: string };
    try {
      payload = await this.jwtService.verifyAsync(token, {
        algorithms: ['HS256'],
      });
    } catch {
      throw new UnauthorizedException();
    }
    const user = await this.userModel
      .findOne({ _id: payload.sub, isActive: true })
      .select('isAdmin')
      .lean();
    if (!user) throw new UnauthorizedException();
    request.user = { id: user._id, isAdmin: user.isAdmin };
    return true;
  }
}
