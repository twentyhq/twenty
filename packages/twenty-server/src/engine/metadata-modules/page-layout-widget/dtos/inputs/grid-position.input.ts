import { Field, InputType } from '@nestjs/graphql';

import { IsInt, IsNotEmpty, Min } from 'class-validator';

@InputType('GridPositionInput')
export class GridPositionInput {
  @Field()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  row: number;

  @Field()
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  column: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  rowSpan: number;

  @Field()
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  columnSpan: number;
}
