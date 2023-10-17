import { IsNumber, IsString } from 'class-validator';

export class CreateTripDto {
  @IsString()
  destinasiPerjalanan: string;
  @IsString()
  tanggalMulaiPerjalanan: Date;
  @IsString()
  tanggalBerakhirPerjalanan: Date;
  @IsNumber()
  price: number;
  @IsString()
  description: string;
  @IsString()
  idUser: string;
}
