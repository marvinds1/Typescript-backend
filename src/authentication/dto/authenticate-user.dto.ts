import { IsEmail, Length } from 'class-validator';

export class AuthenticateUserDto {
  @IsEmail()
  email: string;
  @Length(6, 20, { message: 'password must be between 6 and 20 characters' })
  password: string;
}
