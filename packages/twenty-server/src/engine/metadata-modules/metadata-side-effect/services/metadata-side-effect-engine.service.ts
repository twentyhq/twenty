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
// (operation, metadataName) companion back into the matrix without per-metadata typing.
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
} as const satisfies Record<MetadataSideEffectOperation, keyof GenericFlatEntityOperation>;

type WorklistItem = {
  operation: MetadataSideEffectOperation;
  metadataName: AllMetadataName;
  flatEntity: GenericUniversalFlatEntity;
};

// Expands an intention-carrying operation matrix with system metadata side effects so
// both the metadata API and the application-sync paths produce identical companions.
// For every (operation, metadataName) that has a registered handler, the handler returns
// a partial create/update/delete matrix of companions, merged into the matrix with
// add-if-absent semantics per (operation, metadataName, universalIdentifier). Each newly
// added companion is re-fed to the handler registered for its own operation, so both
// creation cascades (object -> fields -> indexes...) and deletion cascades (object ->
// fields...) resolve to a fixpoint with a cycle guard.
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

    const processedKeys = new Set<string>();
    const worklist: WorklistItem[] = [];

    for (const {
      operation,
      metadataName,
    } of this.metadataSideEffectHandlerRegistryService.getRegisteredHandlerKeys()) {
      const flatEntities =
        expandedMatrix[metadataName]?.[
          OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]
        ] ?? [];

      for (const flatEntity of flatEntities) {
        worklist.push({ operation, metadataName, flatEntity });
      }
    }

    while (worklist.length > 0) {
      const worklistItem = worklist.shift();

      if (!isDefined(worklistItem)) {
        continue;
      }

      const { operation, metadataName, flatEntity } = worklistItem;
      const processedKey = `${operation}:${metadataName}:${flatEntity.universalIdentifier}`;

      if (processedKeys.has(processedKey)) {
        continue;
      }
      processedKeys.add(processedKey);

      const handler = this.metadataSideEffectHandlerRegistryService.getHandler(
        operation,
        metadataName,
      );

      if (!isDefined(handler)) {
        continue;
      }

      const operationsToEnsure = handler.buildSideEffects({
        flatEntity:
          flatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
        allFlatEntityOperationByMetadataName:
          expandedMatrix as unknown as AllFlatEntityOperationByMetadataName,
        context,
      }) as unknown as GenericMetadataSideEffectOperationsByMetadataName;

      for (const ensuredMetadataName of Object.keys(
        operationsToEnsure,
      ) as AllMetadataName[]) {
        const companionOperationBuckets = operationsToEnsure[ensuredMetadataName];

        if (!isDefined(companionOperationBuckets)) {
          continue;
        }

        for (const ensuredOperation of METADATA_SIDE_EFFECT_OPERATIONS) {
          const ensuredFlatEntities =
            companionOperationBuckets[
              OPERATION_TO_FLAT_ENTITY_LIST_KEY[ensuredOperation]
            ] ?? [];

          for (const ensuredFlatEntity of ensuredFlatEntities) {
            const wasAdded = this.addToOperationIfAbsent({
              expandedMatrix,
              operation: ensuredOperation,
              metadataName: ensuredMetadataName,
              flatEntity: ensuredFlatEntity,
            });

            // Re-feed each newly added companion to the handler registered for its own
            // operation, so create/update/delete cascades each resolve to a fixpoint.
            if (
              wasAdded &&
              isDefined(
                this.metadataSideEffectHandlerRegistryService.getHandler(
                  ensuredOperation,
                  ensuredMetadataName,
                ),
              )
            ) {
              worklist.push({
                operation: ensuredOperation,
                metadataName: ensuredMetadataName,
                flatEntity: ensuredFlatEntity,
              });
            }
          }
        }
      }
    }

    return expandedMatrix as unknown as AllFlatEntityOperationByMetadataName;
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

  // Merges a companion into the matrix bucket matching its operation, deduping by
  // universalIdentifier within that bucket. Returns false when it was already planned, so
  // the caller skips re-enqueuing and the fixpoint converges. Cross-operation conflicts
  // (the same universalIdentifier emitted as both create and delete) are intentionally not
  // reconciled here: handlers own disjoint, deterministic companions, so a contradiction
  // signals a handler bug rather than something the engine should silently resolve.
  private addToOperationIfAbsent({
    expandedMatrix,
    operation,
    metadataName,
    flatEntity,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    operation: MetadataSideEffectOperation;
    metadataName: AllMetadataName;
    flatEntity: GenericUniversalFlatEntity;
  }): boolean {
    const operations = (expandedMatrix[metadataName] ??= {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    });

    const operationFlatEntities =
      operations[OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]];

    const alreadyPlanned = operationFlatEntities.some(
      (plannedFlatEntity) =>
        plannedFlatEntity.universalIdentifier === flatEntity.universalIdentifier,
    );

    if (alreadyPlanned) {
      return false;
    }

    operationFlatEntities.push(flatEntity);

    return true;
  }
}
