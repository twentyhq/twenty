import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { ReflectFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-field-metadata.interface';
import { ReflectObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/reflect-object-metadata.interface';

import { TypedReflect } from 'src/utils/typed-reflect';
import { isGatedAndNotEnabled } from 'src/workspace/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

@Injectable()
export class StandardFieldFactory {
  create(
    target: object,
    context: WorkspaceSyncContext,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): PartialFieldMetadata[] {
    const reflectObjectMetadata = TypedReflect.getMetadata(
      'objectMetadata',
      target,
    );
    const reflectFieldMetadataMap =
      TypedReflect.getMetadata('fieldMetadataMap', target) ?? [];

    return Object.values(reflectFieldMetadataMap)
      .map((reflectFieldMetadata) =>
        this.createFieldMetadata(
          reflectObjectMetadata,
          reflectFieldMetadata,
          context,
          workspaceFeatureFlagsMap,
        ),
      )
      .filter((metadata): metadata is PartialFieldMetadata => !!metadata);
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
}
