import { IsString, Length } from 'class-validator';

export class ShahryarMobileUsernameLoginRequestDTO {
  @IsString()
  @Length(1, 80)
  username: string;

  @IsString()
  @Length(1, 500)
  origin: string;

  @IsString()
  @Length(1, 200)
  password: string;
}
