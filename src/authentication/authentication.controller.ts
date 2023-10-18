import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { UserDto } from './dto/user.dto';
import { AuthenticateUserDto } from './dto/authenticate-user.dto';
import { UpdateAuthenticationDto } from './dto/update-authentication.dto';
import { AutGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { User } from './entities/user.entity';

@Controller('authentication')
export class AuthenticationController {
  jwtService: any;
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('/login')
  login(@Body() authenticateUserDto: AuthenticateUserDto) {
    return this.authenticationService.authenticate(authenticateUserDto);
  }

  @Post('/register')
  @UseGuards(AutGuard, AdminGuard)
  register(@Body() registerUserDto: UserDto) {
    return this.authenticationService.register(registerUserDto);
  }

  @Post('/register/admin')
  registerAdmin(@Body() registerUserDto: UserDto) {
    return this.authenticationService.registerAdmin(registerUserDto);
  }

  @UseGuards(AutGuard, AdminGuard)
  @Get('/getall')
  findAll() {
    return this.authenticationService.findAll();
  }

  @UseGuards(AutGuard, AdminGuard)
  @Put('/:id')
  update(
    @Body() updateUserDto: UpdateAuthenticationDto,
    @Param('id') id: string,
  ) {
    return this.authenticationService.update(id, updateUserDto);
  }

  @UseGuards(AutGuard, AdminGuard)
  @Delete('/:id')
  remove(@Param('id') id: string) {
    return this.authenticationService.remove(id);
  }

  @UseGuards(AutGuard)
  @Get('/check-token')
  checkToken(@Request() req: Request) {
    const user = req['user'] as User;
    return {
      user,
      token: this.jwtService.sign({ user }),
    };
  }
}
