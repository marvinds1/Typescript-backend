import { Type } from 'class-transformer';
import {
  IsDate,
  IsNumber,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @IsString()
  @Length(2, 200)
  destinasiPerjalanan: string;

  @Type(() => Date)
  @IsDate()
  tanggalMulaiPerjalanan: Date;

  @Type(() => Date)
  @IsDate()
  tanggalBerakhirPerjalanan: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(1_000_000_000)
  price: number;

  @IsString()
  @MaxLength(2000)
  description: string;

  @IsString()
  idUser: string;
}
