import { IsString, IsNotEmpty } from 'class-validator';

import { IsValidGraphQLEnumName } from 'src/metadata/field-metadata/validators/is-valid-graphql-enum-name.validator';

export class FieldMetadataRelation {
  @IsNotEmpty()
  @IsString()
  label: string;

  @IsNotEmpty()
  @IsValidGraphQLEnumName()
  value: string;
}
