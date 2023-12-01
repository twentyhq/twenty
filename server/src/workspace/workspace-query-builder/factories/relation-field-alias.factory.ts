import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';

import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { isRelationFieldMetadataType } from 'src/workspace/utils/is-relation-field-metadata-type.util';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/workspace/utils/deduce-relation-direction.util';
import { getFieldArgumentsByKey } from 'src/workspace/workspace-query-builder/utils/get-field-arguments-by-key.util';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsStringFactory } from './args-string.factory';

@Injectable()
export class RelationFieldAliasFactory {
  private logger = new Logger(RelationFieldAliasFactory.name);

  constructor(
    @Inject(forwardRef(() => FieldsStringFactory))
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsStringFactory: ArgsStringFactory,
  ) {}

  create(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    info: GraphQLResolveInfo,
  ) {
    if (!isRelationFieldMetadataType(fieldMetadata.type)) {
      throw new Error(`Field ${fieldMetadata.name} is not a relation field`);
    }

    return this.createRelationAlias(fieldKey, fieldValue, fieldMetadata, info);
  }

  private createRelationAlias(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    info: GraphQLResolveInfo,
  ) {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    if (!relationMetadata) {
      throw new Error(
        `Relation metadata not found for field ${fieldMetadata.name}`,
      );
    }

    const relationDirection = deduceRelationDirection(
      fieldMetadata.objectMetadataId,
      relationMetadata,
    );
    const referencedObjectMetadata =
      relationDirection == RelationDirection.TO
        ? relationMetadata.fromObjectMetadata
        : relationMetadata.toObjectMetadata;

    // If it's a relation destination is of kind MANY, we need to add the collection suffix and extract the args
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY &&
      relationDirection === RelationDirection.FROM
    ) {
      const args = getFieldArgumentsByKey(info, fieldKey);
      const argsString = this.argsStringFactory.create(
        args,
        relationMetadata.toObjectMetadata.fields ?? [],
      );
      return `
      ${fieldKey}: ${referencedObjectMetadata.targetTableName}Collection${
        argsString ? `(${argsString})` : ''
      } {
        ${this.fieldsStringFactory.createFieldsStringRecursive(
          info,
          fieldValue,
          relationMetadata.toObjectMetadata.fields ?? [],
        )}
      }
    `;
    }
    let relationAlias = fieldMetadata.isCustom ? `_${fieldKey}` : fieldKey;

    // For one to one relations, pg_graphql use the targetTableName on the side that is not storing the foreign key
    // so we need to alias it to the field key
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE &&
      relationDirection === RelationDirection.FROM
    ) {
      relationAlias = `${fieldKey}: ${referencedObjectMetadata.targetTableName}`;
    }

    // Otherwise it means it's a relation destination is of kind ONE
    return `
      ${relationAlias} {
        ${this.fieldsStringFactory.createFieldsStringRecursive(
          info,
          fieldValue,
          referencedObjectMetadata.fields ?? [],
        )}
      }
    `;
  }
}
