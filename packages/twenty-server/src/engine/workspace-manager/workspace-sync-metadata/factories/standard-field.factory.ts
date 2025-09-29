import { Injectable } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceDynamicRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-dynamic-relation-metadata-args.interface';
import { type WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';
import { type WorkspaceFieldMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-field-metadata-args.interface';
import { type WorkspaceRelationMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-relation-metadata-args.interface';
import {
  type PartialComputedFieldMetadata,
  type PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardFieldFactory {
  create(
    target: typeof BaseWorkspaceEntity,
    context: WorkspaceSyncContext,
  ): (PartialFieldMetadata | PartialComputedFieldMetadata)[];

  create(
    targets: (typeof BaseWorkspaceEntity)[],
    context: WorkspaceSyncContext,
  ): Map<string, (PartialFieldMetadata | PartialComputedFieldMetadata)[]>;

  create(
    targetOrTargets:
      | typeof BaseWorkspaceEntity
      | (typeof BaseWorkspaceEntity)[],
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
            'database',
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
        this.createFieldMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.relations,
        context,
        this.createFieldRelationMetadata,
      ),
      ...this.processMetadata(
        workspaceEntityMetadataArgs,
        metadataCollections.dynamicRelations,
        context,
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
    createMetadata: (
      workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
      args: T,
      context: WorkspaceSyncContext,
    ) => U[],
  ): U[] {
    return metadataArgs
      .flatMap((args) =>
        createMetadata(workspaceEntityMetadataArgs, args, context),
      )
      .filter(Boolean) as U[];
  }

  /**
   * Create field metadata
   */
  private createFieldMetadata(
    _workspaceEntityMetadataArgs: WorkspaceEntityMetadataArgs | undefined,
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
        defaultValue: workspaceFieldMetadataArgs.defaultValue ?? null,
        options: workspaceFieldMetadataArgs.options ?? null,
        settings: workspaceFieldMetadataArgs.settings ?? null,
        standardOverrides: null,
        workspaceId: context.workspaceId,
        isNullable: workspaceFieldMetadataArgs.isNullable,
        isUnique: workspaceFieldMetadataArgs.isUnique,
        isCustom: workspaceFieldMetadataArgs.isDeprecated ? true : false,
        isSystem: workspaceFieldMetadataArgs.isSystem ?? false,
        isActive: workspaceFieldMetadataArgs.isActive ?? true,
        isUIReadOnly: workspaceFieldMetadataArgs.isUIReadOnly ?? false,
        asExpression: workspaceFieldMetadataArgs.asExpression,
        generatedType: workspaceFieldMetadataArgs.generatedType,
        isLabelSyncedWithName: workspaceFieldMetadataArgs.isLabelSyncedWithName,
        relationTargetFieldMetadata: null,
        relationTargetFieldMetadataId: null,
        relationTargetObjectMetadata: null,
        relationTargetObjectMetadataId: null,
        morphId: null,
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
  ): PartialFieldMetadata[] {
    const fieldMetadataCollection: PartialFieldMetadata[] = [];

    if (
      isGatedAndNotEnabled(
        workspaceRelationMetadataArgs.gate,
        context.featureFlags,
      )
    ) {
      return [];
    }

    fieldMetadataCollection.push({
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
      isUIReadOnly: workspaceRelationMetadataArgs.isUIReadOnly,
      isNullable: true,
      isUnique: false,
      isActive: workspaceRelationMetadataArgs.isActive ?? true,
      isLabelSyncedWithName:
        workspaceRelationMetadataArgs.isLabelSyncedWithName,
      defaultValue: null,
      options: null,
      relationTargetFieldMetadata: null,
      relationTargetFieldMetadataId: null,
      relationTargetObjectMetadata: null,
      relationTargetObjectMetadataId: null,
      settings: null, // accurate ? looks weird for this to be undefined even for standard fields ?
      standardOverrides: null,
      morphId: null,
    });

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
