import { Injectable } from '@nestjs/common';

import { WorkspaceTableStructure } from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-table-definition.interface';
import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-issue.interface';
import {
  WorkspaceHealthMode,
  WorkspaceHealthOptions,
} from 'src/engine/workspace-manager/workspace-health/interfaces/workspace-health-options.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { createRelationForeignKeyFieldMetadataName } from 'src/engine/metadata-modules/relation-metadata/utils/create-relation-foreign-key-field-metadata-name.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { convertOnDeleteActionToOnDelete } from 'src/engine/workspace-manager/workspace-migration-runner/utils/convert-on-delete-action-to-on-delete.util';
import { camelCase } from 'src/utils/camel-case';

@Injectable()
export class RelationMetadataHealthService {
  constructor() {}

  public healthCheck(
    workspaceTableColumns: WorkspaceTableStructure[],
    objectMetadataCollection: ObjectMetadataEntity[],
    objectMetadata: ObjectMetadataEntity,
    options: WorkspaceHealthOptions,
  ) {
    const issues: WorkspaceHealthIssue[] = [];

    for (const fieldMetadata of objectMetadata.fields) {
      // We're only interested in relation fields
      if (!isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const relationMetadata =
        fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

      if (!relationMetadata) {
        issues.push({
          type: WorkspaceHealthIssueType.RELATION_METADATA_NOT_VALID,
          message: `Field ${fieldMetadata.id} has invalid relation metadata`,
        });

        continue;
      }

      const relationDirection = deduceRelationDirection(
        fieldMetadata,
        relationMetadata,
      );

      // Many to many relations are not supported yet
      if (relationMetadata.relationType === RelationMetadataType.MANY_TO_MANY) {
        return [];
      }

      const fromObjectMetadata = objectMetadataCollection.find(
        (objectMetadata) =>
          objectMetadata.id === relationMetadata.fromObjectMetadataId,
      );
      const fromFieldMetadata = fromObjectMetadata?.fields.find(
        (fieldMetadata) =>
          fieldMetadata.id === relationMetadata.fromFieldMetadataId,
      );
      const toObjectMetadata = objectMetadataCollection.find(
        (objectMetadata) =>
          objectMetadata.id === relationMetadata.toObjectMetadataId,
      );
      const toFieldMetadata = toObjectMetadata?.fields.find(
        (fieldMetadata) =>
          fieldMetadata.id === relationMetadata.toFieldMetadataId,
      );

      if (!fromFieldMetadata || !toFieldMetadata) {
        issues.push({
          type: WorkspaceHealthIssueType.RELATION_FROM_OR_TO_FIELD_METADATA_NOT_VALID,
          fromFieldMetadata,
          toFieldMetadata,
          relationMetadata,
          message: `Relation ${relationMetadata.id} has invalid from or to field metadata`,
        });

        return issues;
      }

      if (
        options.mode === WorkspaceHealthMode.All ||
        options.mode === WorkspaceHealthMode.Structure
      ) {
        // Check relation structure
        const structureIssues = this.structureRelationCheck(
          fromFieldMetadata,
          toFieldMetadata,
          toObjectMetadata?.fields ?? [],
          relationDirection,
          relationMetadata,
          workspaceTableColumns,
        );

        issues.push(...structureIssues);
      }

      if (
        options.mode === WorkspaceHealthMode.All ||
        options.mode === WorkspaceHealthMode.Metadata
      ) {
        // Check relation metadata
        const metadataIssues = this.metadataRelationCheck(
          fromFieldMetadata,
          toFieldMetadata,
          relationDirection,
          relationMetadata,
        );

        issues.push(...metadataIssues);
      }
    }

    return issues;
  }

  private structureRelationCheck(
    fromFieldMetadata: FieldMetadataEntity,
    toFieldMetadata: FieldMetadataEntity,
    toObjectMetadataFields: FieldMetadataEntity[],
    relationDirection: RelationDirection,
    relationMetadata: RelationMetadataEntity,
    workspaceTableColumns: WorkspaceTableStructure[],
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];

    // Nothing to check on the structure
    if (relationDirection === RelationDirection.FROM) {
      return [];
    }

    const foreignKeyColumnName = `${camelCase(toFieldMetadata.name)}Id`;
    const relationColumn = workspaceTableColumns.find(
      (column) => column.columnName === foreignKeyColumnName,
    );
    const relationFieldMetadata = toObjectMetadataFields.find(
      (fieldMetadata) =>
        fieldMetadata.name ===
        createRelationForeignKeyFieldMetadataName(toFieldMetadata.name),
    );

    if (!relationFieldMetadata) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_NOT_VALID,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        message: `Relation ${
          relationMetadata.id
        } doesn't have a valid foreign key (expected fieldMetadata.name to be ${createRelationForeignKeyFieldMetadataName(
          toFieldMetadata.name,
        )}`,
      });

      return issues;
    }

    if (!relationColumn) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_NOT_VALID,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        message: `Relation ${relationMetadata.id} doesn't have a valid foreign key (expected column name to be ${foreignKeyColumnName}`,
      });

      return issues;
    }

    if (!relationColumn.isForeignKey) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_CONFLICT,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        message: `Relation ${relationMetadata.id} foreign key is not properly set`,
      });
    }

    if (
      relationMetadata.relationType === RelationMetadataType.ONE_TO_ONE &&
      !relationColumn.isUnique
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_CONFLICT,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        message: `Relation ${relationMetadata.id} foreign key is not marked as unique and relation type is one-to-one`,
      });
    }

    if (
      convertOnDeleteActionToOnDelete(relationMetadata.onDeleteAction) !==
      relationColumn.onDeleteAction
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_FOREIGN_KEY_ON_DELETE_ACTION_CONFLICT,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        columnStructure: relationColumn,
        message: `Relation ${relationMetadata.id} foreign key onDeleteAction is not properly set`,
      });
    }

    return issues;
  }

  private metadataRelationCheck(
    fromFieldMetadata: FieldMetadataEntity,
    toFieldMetadata: FieldMetadataEntity,
    relationDirection: RelationDirection,
    relationMetadata: RelationMetadataEntity,
  ): WorkspaceHealthIssue[] {
    const issues: WorkspaceHealthIssue[] = [];

    if (
      !Object.values(RelationMetadataType).includes(
        relationMetadata.relationType,
      )
    ) {
      issues.push({
        type: WorkspaceHealthIssueType.RELATION_TYPE_NOT_VALID,
        fromFieldMetadata,
        toFieldMetadata,
        relationMetadata,
        message: `Relation ${relationMetadata.id} has invalid relation type`,
      });
    }

    return issues;
  }
}
