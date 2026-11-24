import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthenticationService } from './authentication.service';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';
import { AdminGuard } from './guards/admin.guard';
import { AuthGuard, AuthUser } from './guards/auth.guard';

@Controller('authentication')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/login')
  @Throttle({ default: { ttl: 15 * 60_000, limit: 20 } })
  login(@Body() dto: AuthenticateUserDto) {
    return this.authenticationService.authenticate(dto);
  }

  @Post('/register')
  @UseGuards(AuthGuard, AdminGuard)
  register(@Body() dto: UserDto) {
    return this.authenticationService.createUser(dto);
  }

  @Post('/register/admin')
  @UseGuards(AuthGuard, AdminGuard)
  registerAdmin(@Body() dto: UserDto) {
    return this.authenticationService.createUser(dto, true);
  }

  @Get('/getall')
  @UseGuards(AuthGuard, AdminGuard)
  findAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.authenticationService.findAll(limit, skip);
  }

  @Get('/check-token')
  @UseGuards(AuthGuard)
  checkToken(@Req() req: { user: AuthUser }) {
    return this.authenticationService.findUserById(req.user.id);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.authenticationService.update(id, dto);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(id);
  }
}
