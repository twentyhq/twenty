import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsNumber, IsBoolean, IsOptional, IsEmail } from 'class-validator';

@InputType()
export class ImapCredentialsInput {
  @Field()
  @IsEmail()
  email: string;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  password?: string;

  @Field()
  @IsString()
  imapHost: string;

  @Field()
  @IsNumber()
  imapPort: number;

  @Field()
  @IsBoolean()
  useTls: boolean;

  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  accessToken?: string;
}

@ObjectType()
export class ImapConnectionTestResult {
  @Field()
  success: boolean;

  @Field({ nullable: true })
  message?: string;
}

@ObjectType()
export class ImapFolder {
  @Field()
  path: string;

  @Field()
  name: string;

  @Field()
  delimiter: string;

  @Field(() => [String])
  flags: string[];

  @Field({ nullable: true })
  specialUse?: string;
}

@ObjectType()
export class ImapSyncResult {
  @Field()
  synced: number;

  @Field()
  errors: number;
}
