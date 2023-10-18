import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Request,
  UseGuards,
  Put,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AutGuard } from 'src/authentication/guards/auth.guard';
import { AdminGuard } from 'src/authentication/guards/admin.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('trip')
export class TripController {
  constructor(
    private readonly tripService: TripService,
    private jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(AdminGuard, AutGuard)
  create(@Body() createTripDto: CreateTripDto) {
    return this.tripService.create(createTripDto);
  }

  @Get()
  @UseGuards(AdminGuard, AutGuard)
  findAll() {
    return this.tripService.findAll();
  }

  @Get('/mytrip')
  @UseGuards(AutGuard)
  findByUser(@Request() req: Request) {
    const encryp = req.headers['authorization'];
    const decoded = this.jwtService.decode(encryp.split(' ')[1]);
    const id = decoded['user']._id;
    return this.tripService.findByUser(id);
  }

  @Get('/:id')
  @UseGuards(AutGuard)
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Put('/:id')
  @UseGuards(AdminGuard, AutGuard)
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(updateTripDto, id);
  }

  @Delete('/:id')
  @UseGuards(AdminGuard, AutGuard)
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
}
