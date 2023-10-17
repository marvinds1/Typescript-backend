import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AutGuard } from 'src/authentication/guards/auth.guard';
import { AdminGuard } from 'src/authentication/guards/admin.guard';

@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

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

  @Get('/user/:id')
  @UseGuards(AutGuard, AdminGuard)
  findByUser(@Param('id') id: string) {
    return this.tripService.findByUser(+id);
  }

  @Get('/:id')
  @UseGuards(AutGuard)
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(+id);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard, AutGuard)
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(+id, updateTripDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard, AutGuard)
  remove(@Param('id') id: string) {
    return this.tripService.remove(+id);
  }
}
