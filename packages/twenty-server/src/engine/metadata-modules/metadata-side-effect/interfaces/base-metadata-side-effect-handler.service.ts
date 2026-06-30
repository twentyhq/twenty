import { SetMetadata } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { METADATA_SIDE_EFFECT_HANDLER_METADATA_KEY } from 'src/engine/metadata-modules/metadata-side-effect/constants/metadata-side-effect-handler-metadata-key.constant';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import { type MetadataSideEffectOperationsByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operations-by-metadata-name.type';
import { type MetadataSideEffectOperation } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';

export type BuildSideEffectsArgs<P extends AllMetadataName> = {
  // The entity targeted by the triggering operation (created, updated or deleted).
  flatEntity: MetadataUniversalFlatEntity<P>;
  allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  context: MetadataSideEffectContext;
};

// A side-effect handler derives the side-effect operations (create/update/delete) that must
// be applied when an entity of `metadataName` undergoes `operation`. Handlers are pure and
// idempotent: they must dedupe by natural key against the operation matrix being expanded
// and the existing workspace state in the context, and only return what is genuinely
// missing.
export abstract class BaseMetadataSideEffectHandlerService<
  P extends AllMetadataName,
> {
  public operation: MetadataSideEffectOperation;
  public metadataName: P;
  // Human-readable identity of the side effect (what it produces) and the product goal it serves.
  public sideEffectName: string;
  public sideEffectDescription: string;

  abstract buildSideEffects(
    args: BuildSideEffectsArgs<P>,
  ): MetadataSideEffectOperationsByMetadataName;
}

// A handler declares its trigger (operation + metadataName) and identity (name + product goal)
// through a single descriptor passed at the `extends` site. Several handlers can share the same
// (operation, metadataName) trigger; `name` must be unique and `description` states why the
// companion metadata must exist.
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
