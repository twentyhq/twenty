import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import {
  PartialComputedFieldMetadata,
  PartialFieldMetadata,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ReflectFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';
import { ReflectObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';
import { ReflectDynamicRelationFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/reflect-computed-relation-field-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardFieldFactory {
  create(
    target: object,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): (PartialFieldMetadata | PartialComputedFieldMetadata)[] {
    const reflectObjectMetadata = TypedReflect.getMetadata(
      'objectMetadata',
      target,
    );
    const reflectFieldMetadataMap =
      TypedReflect.getMetadata('fieldMetadataMap', target) ?? [];
    const reflectDynamicRelationFieldMetadataMap = TypedReflect.getMetadata(
      'dynamicRelationFieldMetadataMap',
      target,
    );
    const partialFieldMetadataCollection: (
      | PartialFieldMetadata
      | PartialComputedFieldMetadata
    )[] = Object.values(reflectFieldMetadataMap)
      .map((reflectFieldMetadata) =>
        this.createFieldMetadata(
          reflectObjectMetadata,
          reflectFieldMetadata,
          context,
          workspaceFeatureFlagsMap,
        ),
      )
      .filter((metadata): metadata is PartialFieldMetadata => !!metadata);
    const partialComputedFieldMetadata = this.createComputedFieldMetadata(
      reflectDynamicRelationFieldMetadataMap,
      context,
      workspaceFeatureFlagsMap,
    );

    if (partialComputedFieldMetadata) {
      partialFieldMetadataCollection.push(partialComputedFieldMetadata);
    }

    return partialFieldMetadataCollection;
  }

  private createFieldMetadata(
    reflectObjectMetadata: ReflectObjectMetadata | undefined,
    reflectFieldMetadata: ReflectFieldMetadata[string],
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialFieldMetadata | undefined {
    if (
      isGatedAndNotEnabled(reflectFieldMetadata.gate, workspaceFeatureFlagsMap)
    ) {
      return undefined;
    }

    return {
      ...reflectFieldMetadata,
      workspaceId: context.workspaceId,
      isSystem:
        reflectObjectMetadata?.isSystem || reflectFieldMetadata.isSystem,
    };
  }

  private createComputedFieldMetadata(
    reflectDynamicRelationFieldMetadata:
      | ReflectDynamicRelationFieldMetadata
      | undefined,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialComputedFieldMetadata | undefined {
    if (
      !reflectDynamicRelationFieldMetadata ||
      isGatedAndNotEnabled(
        reflectDynamicRelationFieldMetadata.gate,
        workspaceFeatureFlagsMap,
      )
    ) {
      return undefined;
    }

    return {
      ...reflectDynamicRelationFieldMetadata,
      workspaceId: context.workspaceId,
      isSystem: reflectDynamicRelationFieldMetadata.isSystem,
    };
  }
}
