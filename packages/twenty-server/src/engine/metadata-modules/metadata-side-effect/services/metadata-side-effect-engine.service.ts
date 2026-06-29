import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import {
  METADATA_SIDE_EFFECT_OPERATIONS,
  type MetadataSideEffectOperation,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';

// Minimal structural view of the operation matrix so the engine can read and mutate any
// metadata slot generically without fighting the per-metadata mapped type (a union of
// FlatEntityToCreateDeleteUpdate<P> whose array element types are mutually incompatible).
type GenericUniversalFlatEntity = { universalIdentifier: string };
type GenericFlatEntityOperation = {
  flatEntityToCreate: GenericUniversalFlatEntity[];
  flatEntityToUpdate: GenericUniversalFlatEntity[];
  flatEntityToDelete: GenericUniversalFlatEntity[];
};
type GenericAllFlatEntityOperationByMetadataName = Record<
  string,
  GenericFlatEntityOperation | undefined
>;

// Structural view of what a handler returns (partial buckets), so the engine can fold any
// (operation, metadataName) side-effect entity into the matrix without per-metadata typing.
type GenericPartialFlatEntityOperation = {
  flatEntityToCreate?: GenericUniversalFlatEntity[];
  flatEntityToUpdate?: GenericUniversalFlatEntity[];
  flatEntityToDelete?: GenericUniversalFlatEntity[];
};
type GenericMetadataSideEffectOperationsByMetadataName = Record<
  string,
  GenericPartialFlatEntityOperation | undefined
>;

const OPERATION_TO_FLAT_ENTITY_LIST_KEY = {
  create: 'flatEntityToCreate',
  update: 'flatEntityToUpdate',
  delete: 'flatEntityToDelete',
} as const satisfies Record<
  MetadataSideEffectOperation,
  keyof GenericFlatEntityOperation
>;

// Expands an intention-carrying operation matrix with system metadata side effects so both
// the metadata API and the application-sync paths produce identical results. For every
// (operation, metadataName) with a registered handler, the handler runs once per entity the
// *caller* put in that bucket, and the side-effect entities it returns are merged into the
// matrix with add-if-absent semantics per (operation, metadataName, universalIdentifier).
// Side effects are intentionally NON-RECURSIVE: a side-effect entity is never itself run
// through a handler (a side-effect field does not trigger the field side effect), so this is
// a single pass over the caller's input, not a fixpoint.
@Injectable()
export class MetadataSideEffectEngineService {
  constructor(
    private readonly metadataSideEffectHandlerRegistryService: MetadataSideEffectHandlerRegistryService,
  ) {}

  expandWithSideEffects({
    allFlatEntityOperationByMetadataName,
    context,
  }: {
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
    context: MetadataSideEffectContext;
  }): AllFlatEntityOperationByMetadataName {
    const expandedMatrix: GenericAllFlatEntityOperationByMetadataName =
      this.cloneMatrix(allFlatEntityOperationByMetadataName);

    // Triggers are read from the caller's input only, never from expandedMatrix, so the
    // side effects merged below can never trigger another handler (non-recursive).
    const triggerMatrix =
      allFlatEntityOperationByMetadataName as unknown as GenericAllFlatEntityOperationByMetadataName;

    for (const {
      operation,
      metadataName,
    } of this.metadataSideEffectHandlerRegistryService.getRegisteredHandlerKeys()) {
      const handler = this.metadataSideEffectHandlerRegistryService.getHandler(
        operation,
        metadataName,
      );

      if (!isDefined(handler)) {
        continue;
      }

      const triggerFlatEntities =
        triggerMatrix[metadataName]?.[
          OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]
        ] ?? [];

      for (const triggerFlatEntity of triggerFlatEntities) {
        const sideEffectOperations = handler.buildSideEffects({
          flatEntity:
            triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
          allFlatEntityOperationByMetadataName:
            expandedMatrix as unknown as AllFlatEntityOperationByMetadataName,
          context,
        }) as unknown as GenericMetadataSideEffectOperationsByMetadataName;

        this.mergeSideEffectsIntoMatrix({
          expandedMatrix,
          sideEffectOperations,
        });
      }
    }

    return expandedMatrix as unknown as AllFlatEntityOperationByMetadataName;
  }

  private mergeSideEffectsIntoMatrix({
    expandedMatrix,
    sideEffectOperations,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    sideEffectOperations: GenericMetadataSideEffectOperationsByMetadataName;
  }): void {
    for (const metadataName of Object.keys(sideEffectOperations)) {
      const operationBuckets = sideEffectOperations[metadataName];

      if (!isDefined(operationBuckets)) {
        continue;
      }

      for (const operation of METADATA_SIDE_EFFECT_OPERATIONS) {
        const sideEffectFlatEntities =
          operationBuckets[OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]] ?? [];

        for (const sideEffectFlatEntity of sideEffectFlatEntities) {
          this.addToOperationIfAbsent({
            expandedMatrix,
            operation,
            metadataName,
            flatEntity: sideEffectFlatEntity,
          });
        }
      }
    }
  }

  private cloneMatrix(
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName,
  ): GenericAllFlatEntityOperationByMetadataName {
    const genericMatrix =
      allFlatEntityOperationByMetadataName as unknown as GenericAllFlatEntityOperationByMetadataName;
    const clonedMatrix: GenericAllFlatEntityOperationByMetadataName = {};

    for (const metadataName of Object.keys(genericMatrix)) {
      const operations = genericMatrix[metadataName];

      if (!isDefined(operations)) {
        continue;
      }

      // Shallow-clone the operation lists so expansion never mutates the caller's matrix.
      // Entities themselves are not cloned: handlers must treat them as read-only.
      clonedMatrix[metadataName] = {
        flatEntityToCreate: [...operations.flatEntityToCreate],
        flatEntityToUpdate: [...operations.flatEntityToUpdate],
        flatEntityToDelete: [...operations.flatEntityToDelete],
      };
    }

    return clonedMatrix;
  }

  // Merges a side-effect entity into the matrix bucket matching its operation, deduping by
  // universalIdentifier within that bucket so two handlers emitting the same entity collapse
  // to one. Cross-operation conflicts (the same universalIdentifier emitted as both create
  // and delete) are intentionally not reconciled: handlers own disjoint, deterministic
  // entities, so a contradiction signals a handler bug rather than something to resolve here.
  private addToOperationIfAbsent({
    expandedMatrix,
    operation,
    metadataName,
    flatEntity,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    operation: MetadataSideEffectOperation;
    metadataName: string;
    flatEntity: GenericUniversalFlatEntity;
  }): void {
    const operations = (expandedMatrix[metadataName] ??= {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    });

    const operationFlatEntities =
      operations[OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]];

    const alreadyPlanned = operationFlatEntities.some(
      (plannedFlatEntity) =>
        plannedFlatEntity.universalIdentifier ===
        flatEntity.universalIdentifier,
    );

    if (alreadyPlanned) {
      return;
    }

    operationFlatEntities.push(flatEntity);
  }
}
