import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { UserDto } from './user.dto';

export class UpdateUserDto extends PartialType(UserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
