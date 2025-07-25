import { Field, ObjectType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { RestrictedFields } from 'twenty-shared/types';

import { ObjectPermissionDTO } from './object-permission.dto';

@ObjectType('ObjectPermissionsWithRestrictedFields')
export class ObjectPermissionsWithRestrictedFieldsDTO extends ObjectPermissionDTO {
  @Field(() => GraphQLJSON, {
    nullable: true,
  })
  restrictedFields?: RestrictedFields;
}
