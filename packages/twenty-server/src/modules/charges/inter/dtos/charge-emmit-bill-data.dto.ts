import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

import {
  InterCustomerType,
  InterCustomerUf,
} from 'src/engine/core-modules/inter/interfaces/charge.interface';

export class ChargeEmmitBillDataDto {
  @Length(11, 18)
  @IsNumberString()
  @IsNotEmpty()
  cpfCnpj: string;

  @IsEnum(InterCustomerType)
  @IsNotEmpty()
  legalEntity: InterCustomerType;

  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  name: string;

  @Length(1, 100)
  @IsString()
  @IsNotEmpty()
  address: string;

  @Length(1, 60)
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsEnum(InterCustomerUf)
  @IsNotEmpty()
  stateUnity: InterCustomerUf;

  @IsNumberString()
  @Length(8, 8)
  @IsString()
  @IsNotEmpty()
  cep: string;
}
