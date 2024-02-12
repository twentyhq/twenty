import { Injectable } from '@nestjs/common';

import { WorkspaceTableStructure } from 'src/workspace/workspace-health/interfaces/workspace-table-definition.interface';
import {
  WorkspaceHealthIssue,
  WorkspaceHealthIssueType,
} from 'src/workspace/workspace-health/interfaces/workspace-health-issue.interface';
import {
  WorkspaceHealthMode,
  WorkspaceHealthOptions,
} from 'src/workspace/workspace-health/interfaces/workspace-health-options.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/workspace/utils/deduce-relation-direction.util';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import { createRelationForeignKeyColumnName } from 'src/metadata/relation-metadata/utils/create-relation-foreign-key-column-name.util';
import { createRelationForeignKeyFieldMetadataName } from 'src/metadata/relation-metadata/utils/create-relation-foreign-key-field-metadata-name.util';

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
      if (fieldMetadata.type !== FieldMetadataType.RELATION) {
        continue;
      }

      const relationMetadata =
        fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;
      const relationDirection = deduceRelationDirection(
        objectMetadata.id,
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

    const isCustom = toFieldMetadata.isCustom ?? false;
    const foreignKeyColumnName = createRelationForeignKeyColumnName(
      toFieldMetadata.name,
      isCustom,
    );
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
