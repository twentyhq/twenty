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
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

import { FieldsStringFactory } from './fields-string.factory';
import { ArgsStringFactory } from './args-string.factory';

@Injectable()
export class RelationFieldAliasFactory {
  private logger = new Logger(RelationFieldAliasFactory.name);

  constructor(
    @Inject(forwardRef(() => FieldsStringFactory))
    private readonly fieldsStringFactory: FieldsStringFactory,
    private readonly argsStringFactory: ArgsStringFactory,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {}

  create(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    info: GraphQLResolveInfo,
  ): Promise<string> {
    if (!isRelationFieldMetadataType(fieldMetadata.type)) {
      throw new Error(`Field ${fieldMetadata.name} is not a relation field`);
    }

    return this.createRelationAlias(fieldKey, fieldValue, fieldMetadata, info);
  }

  private async createRelationAlias(
    fieldKey: string,
    fieldValue: any,
    fieldMetadata: FieldMetadataInterface,
    info: GraphQLResolveInfo,
  ): Promise<string> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    if (!relationMetadata) {
      throw new Error(
        `Relation metadata not found for field ${fieldMetadata.name}`,
      );
    }

    if (!fieldMetadata.workspaceId) {
      throw new Error(
        `Workspace id not found for field ${fieldMetadata.name} in object metadata ${fieldMetadata.objectMetadataId}`,
      );
    }

    const relationDirection = deduceRelationDirection(
      fieldMetadata.objectMetadataId,
      relationMetadata,
    );
    // Retrieve the referenced object metadata based on the relation direction
    // Mandatory to handle n+n relations
    const referencedObjectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(
        fieldMetadata.workspaceId,
        {
          where: {
            id:
              relationDirection == RelationDirection.TO
                ? relationMetadata.fromObjectMetadataId
                : relationMetadata.toObjectMetadataId,
          },
        },
      );

    if (!referencedObjectMetadata) {
      throw new Error(
        `Referenced object metadata not found for relation ${relationMetadata.id}`,
      );
    }

    // If it's a relation destination is of kind MANY, we need to add the collection suffix and extract the args
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_MANY &&
      relationDirection === RelationDirection.FROM
    ) {
      const args = getFieldArgumentsByKey(info, fieldKey);
      const argsString = this.argsStringFactory.create(
        args,
        referencedObjectMetadata.fields ?? [],
      );
      const fieldsString =
        await this.fieldsStringFactory.createFieldsStringRecursive(
          info,
          fieldValue,
          referencedObjectMetadata.fields ?? [],
        );

      return `
        ${fieldKey}: ${referencedObjectMetadata.targetTableName}Collection${
          argsString ? `(${argsString})` : ''
        } {
          ${fieldsString}
        }
      `;
    }
    let relationAlias = fieldMetadata.isCustom
      ? `${fieldKey}: ${fieldMetadata.targetColumnMap.value}`
      : fieldKey;

    // For one to one relations, pg_graphql use the targetTableName on the side that is not storing the foreign key
    // so we need to alias it to the field key
    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE &&
      relationDirection === RelationDirection.FROM
    ) {
      relationAlias = `${fieldKey}: ${referencedObjectMetadata.targetTableName}`;
    }
    const fieldsString =
      await this.fieldsStringFactory.createFieldsStringRecursive(
        info,
        fieldValue,
        referencedObjectMetadata.fields ?? [],
      );

    // Otherwise it means it's a relation destination is of kind ONE
    return `
      ${relationAlias} {
        ${fieldsString}
      }
    `;
  }
}
