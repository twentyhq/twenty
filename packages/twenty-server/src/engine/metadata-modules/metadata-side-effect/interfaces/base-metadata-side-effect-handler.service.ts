import { SetMetadata } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { METADATA_SIDE_EFFECT_HANDLER_METADATA_KEY } from 'src/engine/metadata-modules/metadata-side-effect/constants/metadata-side-effect-handler-metadata-key.constant';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import { type MetadataSideEffectOperation } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

export type BuildSideEffectsArgs<P extends AllMetadataName> = {
  flatEntity: MetadataUniversalFlatEntity<P>;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  relatedFlatEntityMaps: MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<P>;
  context: MetadataSideEffectContext;
};

export abstract class BaseMetadataSideEffectHandlerService<
  P extends AllMetadataName,
> {
  public operation: MetadataSideEffectOperation;
  public metadataName: P;
  public sideEffectName: string;
  public sideEffectDescription: string;

  abstract buildSideEffects(
    args: BuildSideEffectsArgs<P>,
  ): MetadataSideEffectResult;
}

type MetadataSideEffectHandlerDeclaration<P extends AllMetadataName> = {
  operation: MetadataSideEffectOperation;
  metadataName: P;
  name: string;
  description: string;
};

export function MetadataSideEffectHandler<P extends AllMetadataName>({
  operation,
  metadataName,
  name,
  description,
}: MetadataSideEffectHandlerDeclaration<P>): typeof BaseMetadataSideEffectHandlerService<P> {
  abstract class SideEffectHandlerService extends BaseMetadataSideEffectHandlerService<P> {
    operation = operation;
    metadataName = metadataName;
    sideEffectName = name;
    sideEffectDescription = description;
  }

  SetMetadata(METADATA_SIDE_EFFECT_HANDLER_METADATA_KEY, {
    operation,
    metadataName,
    name,
    description,
  })(SideEffectHandlerService);

  return SideEffectHandlerService;
}
