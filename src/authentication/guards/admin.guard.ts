import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // Import service JWT dari NestJS

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;

    if (!token) {
      return false; // Jika tidak ada token, akses ditolak.
    }

    const decoded = this.jwtService.decode(token.split(' ')[1]); // Decode token
    const user = decoded['user']; // Ambil data user dari token
    return user.isAdmin; // Jika isAdmin true, akses diberikan.
  }
}
