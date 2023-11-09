import { ResolverBuilderMethodNames } from 'src/tenant/resolver-builder/interfaces/resolvers-builder.interface';
import { ArgMetadata } from 'src/tenant/schema-builder/interfaces/param-metadata.interface';

import { InputTypeDefinitionKind } from 'src/tenant/schema-builder/factories/input-type-definition.factory';
import { FieldMetadataType } from 'src/database/typeorm/metadata/entities/field-metadata.entity';

export const getResolverArgs = (
  type: ResolverBuilderMethodNames,
): { [key: string]: ArgMetadata } => {
  switch (type) {
    case 'findMany':
      return {
        first: {
          type: FieldMetadataType.NUMBER,
          isNullable: true,
        },
        last: {
          type: FieldMetadataType.NUMBER,
          isNullable: true,
        },
        before: {
          type: FieldMetadataType.TEXT,
          isNullable: true,
        },
        after: {
          type: FieldMetadataType.TEXT,
          isNullable: true,
        },
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: true,
        },
        orderBy: {
          kind: InputTypeDefinitionKind.OrderBy,
          isNullable: true,
        },
      };
    case 'findOne':
      return {
        filter: {
          kind: InputTypeDefinitionKind.Filter,
          isNullable: false,
        },
      };
    case 'createMany':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
          isArray: true,
        },
      };
    case 'createOne':
      return {
        data: {
          kind: InputTypeDefinitionKind.Create,
          isNullable: false,
        },
      };
    case 'updateOne':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: false,
        },
        data: {
          kind: InputTypeDefinitionKind.Update,
          isNullable: false,
        },
      };
    case 'deleteOne':
      return {
        id: {
          type: FieldMetadataType.UUID,
          isNullable: false,
        },
      };
    default:
      throw new Error(`Unknown resolver type: ${type}`);
  }
};
