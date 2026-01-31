import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UploadLogicFunctionSourceCodeResultDTO {
  @Field({ description: 'The computed checksum of the uploaded source code' })
  checksum: string;

  @Field({ description: 'Whether the upload and build was successful' })
  success: boolean;
}
