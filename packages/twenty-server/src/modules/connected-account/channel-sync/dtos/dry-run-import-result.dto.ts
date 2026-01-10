import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('DryRunImportResult')
export class DryRunImportResultDTO {
  @Field(() => Int)
  totalMessagesInFolder: number;

  @Field(() => Int)
  messagesToImport: number;

  @Field(() => Int)
  alreadyImported: number;
}
