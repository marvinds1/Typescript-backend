import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../authentication/guards/admin.guard';
import { AuthGuard, AuthUser } from '../authentication/guards/auth.guard';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripService } from './trip.service';

@Controller('trip')
@UseGuards(AuthGuard)
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() dto: CreateTripDto) {
    return this.tripService.create(dto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('skip', new DefaultValuePipe(0), ParseIntPipe) skip: number,
  ) {
    return this.tripService.findAll(limit, skip);
  }

  @Get('/mytrip')
  findMine(@Req() req: { user: AuthUser }) {
    return this.tripService.findByUser(req.user.id);
  }

  @Get('/:id')
  findOne(@Param('id') id: string, @Req() req: { user: AuthUser }) {
    return this.tripService.findOne(id, req.user);
  }

  @Patch('/:id')
  @UseGuards(AdminGuard)
  update(@Param('id') id: string, @Body() dto: UpdateTripDto) {
    return this.tripService.update(id, dto);
  }

  @Delete('/:id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.tripService.remove(id);
  }
}
