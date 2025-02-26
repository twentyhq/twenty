import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import {
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { getJoinColumn } from 'src/engine/twenty-orm/utils/get-join-column.util';
import { convertClassNameToObjectMetadataName } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/convert-class-to-object-metadata-name.util';
import { createDeterministicUuid } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/create-deterministic-uuid.util';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';
import { assert } from 'src/utils/assert';

@Injectable()
export class StandardFieldFactory {
  create(
    target: typeof BaseWorkspaceEntity,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    context: WorkspaceSyncContext,
  ): (PartialFieldMetadata | PartialComputedFieldMetadata)[];

  create(
    targets: (typeof BaseWorkspaceEntity)[],
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    context: WorkspaceSyncContext,
  ): Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]>;

  create(
    targetOrTargets:
      | typeof BaseWorkspaceEntity
      | (typeof BaseWorkspaceEntity)[],
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    context: WorkspaceSyncContext,
  ):
    | (PartialFieldMetadata | PartialComputedFieldMetadata)[]
    | Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]> {
    if (Array.isArray(targetOrTargets)) {
      return targetOrTargets.reduce((acc, target) => {
        const workspaceEntityMetadataArgs =
          metadataArgsStorage.filterEntities(target);

        if (!workspaceEntityMetadataArgs) {
          return acc;
        }

        if (
          isGatedAndNotEnabled(
            workspaceEntityMetadataArgs.gate,
            context.featureFlags,
          )
        ) {
          return acc;
        }

        acc.set(
          workspaceEntityMetadataArgs.standardId,
          this.create(target, context),
        );

        return acc;
      }, new Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]>());
    }

    const workspaceEntityMetadataArgs =
      metadataArgsStorage.filterEntities(targetOrTargets);
    const metadataCollections = this.collectMetadata(targetOrTargets);

    return [
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.fields,
        context,
        originalObjectMetadataMap,
        this.createFieldMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.relations,
        context,
        originalObjectMetadataMap,
        this.createFieldRelationMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.dynamicRelations,
        context,
        originalObjectMetadataMap,
        this.createComputedFieldRelationMetadata,
      ),
    ];
  }

  private collectMetadata(target: typeof BaseWorkspaceEntity) {
    return {
      fields: metadataArgsStorage.filterFields(target),
      relations: metadataArgsStorage.filterRelations(target),
      dynamicRelations: metadataArgsStorage.filterDynamicRelations(target),
    };
  }

  private processMetadata<
    T,
    U extends PartialFieldMetadata | PartialComputedFieldMetadata,
  >(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    metadataArgs: T[],
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    createMetadata: (
      workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
      args: T,
      context: WorkspaceSyncContext,
      originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
    ) => U[],
  ): U[] {
    return metadataArgs
      .flatMap((args) =>
        createMetadata(
          workspaceEntityMetadataArgs,
          args,
          context,
          originalObjectMetadataMap,
        ),
      )
      .filter(Boolean) as U[];
  }

  /**
   * Create field metadata
   */
  private createFieldMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceFieldMetadataArgs: WorkspaceFieldMetadataArgs,
    context: WorkspaceSyncContext,
  ): PartialFieldMetadata[] {
    if (
      isGatedAndNotEnabled(
        workspaceFieldMetadataArgs.gate,
        context.featureFlags,
      )
    ) {
      return [];
    }

    return [
      {
        type: workspaceFieldMetadataArgs.type,
        standardId: workspaceFieldMetadataArgs.standardId,
        name: workspaceFieldMetadataArgs.name,
        icon: workspaceFieldMetadataArgs.icon,
        label: workspaceFieldMetadataArgs.label,
        description: workspaceFieldMetadataArgs.description,
        defaultValue: workspaceFieldMetadataArgs.defaultValue,
        options: workspaceFieldMetadataArgs.options,
        settings: workspaceFieldMetadataArgs.settings,
        workspaceId: context.workspaceId,
        isNullable: workspaceFieldMetadataArgs.isNullable,
        isUnique: workspaceFieldMetadataArgs.isUnique,
        isCustom: workspaceFieldMetadataArgs.isDeprecated ? true : false,
        isSystem: workspaceFieldMetadataArgs.isSystem ?? false,
        isActive: workspaceFieldMetadataArgs.isActive ?? true,
        asExpression: workspaceFieldMetadataArgs.asExpression,
        generatedType: workspaceFieldMetadataArgs.generatedType,
      },
    ];
  }

  /**
   * Create relation field metadata
   */
  private createFieldRelationMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceRelationMetadataArgs: WorkspaceRelationMetadataArgs,
    context: WorkspaceSyncContext,
    originalObjectMetadataMap: Record<string, ObjectMetadataEntity>,
  ): PartialFieldMetadata[] {
    const isNewRelationEnabled =
      context.featureFlags[FeatureFlagKey.IsNewRelationEnabled];

    const fieldMetadataCollection: PartialFieldMetadata[] = [];
    const foreignKeyStandardId = createDeterministicUuid(
      workspaceRelationMetadataArgs.standardId,
    );
    const joinColumnMetadataArgsCollection =
      metadataArgsStorage.filterJoinColumns(
        workspaceRelationMetadataArgs.target,
      );
    const joinColumn = getJoinColumn(
      joinColumnMetadataArgsCollection,
      workspaceRelationMetadataArgs,
    );

    if (
      isGatedAndNotEnabled(
        workspaceRelationMetadataArgs.gate,
        context.featureFlags,
      )
    ) {
      return [];
    }

    // We don't want to create the join column field metadata for new relation
    if (!isNewRelationEnabled && joinColumn) {
      fieldMetadataCollection.push({
        type: FieldMetadataType.UUID,
        standardId: foreignKeyStandardId,
        name: joinColumn,
        label: `${workspaceRelationMetadataArgs.label} id (foreign key)`,
        description: `${workspaceRelationMetadataArgs.description} id foreign key`,
        icon: workspaceRelationMetadataArgs.icon,
        defaultValue: null,
        options: undefined,
        settings: undefined,
        workspaceId: context.workspaceId,
        isCustom: false,
        isSystem: true,
        isNullable: workspaceRelationMetadataArgs.isNullable,
        isUnique:
          workspaceRelationMetadataArgs.type === RelationType.ONE_TO_ONE,
        isActive: workspaceRelationMetadataArgs.isActive ?? true,
      });
    }

    let fieldMetadataRelation: PartialFieldMetadata<FieldMetadataType.RELATION> =
      {
        type: FieldMetadataType.RELATION,
        standardId: workspaceRelationMetadataArgs.standardId,
        name: workspaceRelationMetadataArgs.name,
        label: workspaceRelationMetadataArgs.label,
        description: workspaceRelationMetadataArgs.description,
        icon: workspaceRelationMetadataArgs.icon,
        workspaceId: context.workspaceId,
        isCustom: false,
        isSystem:
          workspaceEntityMetadataArgs?.isSystem ||
          workspaceRelationMetadataArgs.isSystem,
        isNullable: true,
        isUnique:
          workspaceRelationMetadataArgs.type === RelationType.ONE_TO_ONE,
        isActive: workspaceRelationMetadataArgs.isActive ?? true,
      };

    if (isNewRelationEnabled) {
      const fromObjectNameSingular = convertClassNameToObjectMetadataName(
        workspaceRelationMetadataArgs.target.name,
      );
      const toObjectNameSingular = convertClassNameToObjectMetadataName(
        workspaceRelationMetadataArgs.inverseSideTarget().name,
      );
      const toFieldMetadataName =
        (workspaceRelationMetadataArgs.inverseSideFieldKey as
          | string
          | undefined) ?? fromObjectNameSingular;

      const toObjectMetadata = originalObjectMetadataMap[toObjectNameSingular];

      assert(
        toObjectMetadata,
        `Object ${toObjectNameSingular} not found in DB
    for relation TO defined in class ${fromObjectNameSingular}`,
      );

      const toFieldMetadata = toObjectMetadata?.fields.find(
        (field) => field.name === toFieldMetadataName,
      );

      assert(
        toFieldMetadata,
        `Field ${toFieldMetadataName} not found in object ${toObjectNameSingular}
    for relation TO defined in class ${fromObjectNameSingular}`,
      );

      fieldMetadataRelation = {
        ...fieldMetadataRelation,
        settings: {
          relationType: workspaceRelationMetadataArgs.type,
          onDelete: workspaceRelationMetadataArgs.onDelete,
          joinColumnName: joinColumn,
        },
        relationTargetFieldMetadataId: toFieldMetadata?.id,
        relationTargetObjectMetadataId: toObjectMetadata?.id,
      };
    }

    fieldMetadataCollection.push(fieldMetadataRelation);

    return fieldMetadataCollection;
  }

  /**
   * Create computed field relation metadata
   */
  private createComputedFieldRelationMetadata(
    workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
    workspaceDynamicRelationMetadataArgs:
      | WorkspaceDynamicRelationMetadataArgs
      | undefined,
    context: WorkspaceSyncContext,
  ): PartialComputedFieldMetadata[] {
    if (
      !workspaceDynamicRelationMetadataArgs ||
      isGatedAndNotEnabled(
        workspaceDynamicRelationMetadataArgs.gate,
        context.featureFlags,
      )
    ) {
      return [];
    }

    return [
      // Foreign key will be computed in compute-standard-object.util.ts, because we need to know the custom object
      {
        type: FieldMetadataType.RELATION,
        argsFactory: workspaceDynamicRelationMetadataArgs.argsFactory,
        workspaceId: context.workspaceId,
        isCustom: false,
        isSystem:
          workspaceEntityMetadataArgs?.isSystem ||
          workspaceDynamicRelationMetadataArgs.isSystem,
        isNullable: workspaceDynamicRelationMetadataArgs.isNullable,
      },
    ];
  }
}
