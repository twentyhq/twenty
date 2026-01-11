import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('DryRunImportResult')
export class DryRunImportResultDTO {
  @Field(() => Int)
  totalMessagesInFolder: number;

  @Field(() => Int)
  messagesToImport: number;

  @Field(() => Int)
  alreadyImported: number;

  @Field(() => Int)
  pendingImport: number;

  @Field(() => Boolean, {
    description:
      'When true, messagesToImport is an estimate. Actual count may be lower due to email filtering (group emails, blocklist, etc.)',
  })
  isEstimate: boolean;
}
