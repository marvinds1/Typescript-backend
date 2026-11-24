import { Transform } from 'class-transformer';
import { IsEmail, IsString, Length, MaxLength } from 'class-validator';

export class UserDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsEmail()
  @MaxLength(255)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  email: string;

  @Length(8, 72, { message: 'password must be between 8 and 72 characters' })
  password: string;
}
