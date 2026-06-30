import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import {
  METADATA_SIDE_EFFECT_OPERATIONS,
  type MetadataSideEffectOperation,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';

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

type GenericPartialFlatEntityOperation = {
  flatEntityToCreate?: GenericUniversalFlatEntity[];
  flatEntityToUpdate?: GenericUniversalFlatEntity[];
  flatEntityToDelete?: GenericUniversalFlatEntity[];
};
type GenericMetadataSideEffectOperationsByMetadataName = Record<
  string,
  GenericPartialFlatEntityOperation | undefined
>;

type SeenUniversalIdentifiersByOperation = {
  flatEntityToCreate: Set<string>;
  flatEntityToUpdate: Set<string>;
  flatEntityToDelete: Set<string>;
};
type SeenUniversalIdentifiersByMetadataName = Record<
  string,
  SeenUniversalIdentifiersByOperation | undefined
>;

const OPERATION_TO_FLAT_ENTITY_LIST_KEY = {
  create: 'flatEntityToCreate',
  update: 'flatEntityToUpdate',
  delete: 'flatEntityToDelete',
} as const satisfies Record<
  MetadataSideEffectOperation,
  keyof GenericFlatEntityOperation
>;

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
    const seenUniversalIdentifiers =
      this.buildSeenUniversalIdentifiers(expandedMatrix);

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
        if (
          isSystemSideEffectFlatEntity(
            triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
          )
        ) {
          continue;
        }

        const sideEffectOperations = handler.buildSideEffects({
          flatEntity:
            triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
          allFlatEntityOperationByMetadataName:
            expandedMatrix as unknown as AllFlatEntityOperationByMetadataName,
          context,
        }) as unknown as GenericMetadataSideEffectOperationsByMetadataName;

        this.mergeSideEffectsIntoMatrix({
          expandedMatrix,
          seenUniversalIdentifiers,
          sideEffectOperations,
        });
      }
    }

    return expandedMatrix as unknown as AllFlatEntityOperationByMetadataName;
  }

  private mergeSideEffectsIntoMatrix({
    expandedMatrix,
    seenUniversalIdentifiers,
    sideEffectOperations,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    seenUniversalIdentifiers: SeenUniversalIdentifiersByMetadataName;
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
            seenUniversalIdentifiers,
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

      clonedMatrix[metadataName] = {
        flatEntityToCreate: [...operations.flatEntityToCreate],
        flatEntityToUpdate: [...operations.flatEntityToUpdate],
        flatEntityToDelete: [...operations.flatEntityToDelete],
      };
    }

    return clonedMatrix;
  }

  private buildSeenUniversalIdentifiers(
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName,
  ): SeenUniversalIdentifiersByMetadataName {
    const seenUniversalIdentifiers: SeenUniversalIdentifiersByMetadataName = {};

    for (const metadataName of Object.keys(expandedMatrix)) {
      const operations = expandedMatrix[metadataName];

      if (!isDefined(operations)) {
        continue;
      }

      seenUniversalIdentifiers[metadataName] = {
        flatEntityToCreate: this.toUniversalIdentifierSet(
          operations.flatEntityToCreate,
        ),
        flatEntityToUpdate: this.toUniversalIdentifierSet(
          operations.flatEntityToUpdate,
        ),
        flatEntityToDelete: this.toUniversalIdentifierSet(
          operations.flatEntityToDelete,
        ),
      };
    }

    return seenUniversalIdentifiers;
  }

  private toUniversalIdentifierSet(
    flatEntities: GenericUniversalFlatEntity[],
  ): Set<string> {
    return new Set(
      flatEntities.map((flatEntity) => flatEntity.universalIdentifier),
    );
  }

  private addToOperationIfAbsent({
    expandedMatrix,
    seenUniversalIdentifiers,
    operation,
    metadataName,
    flatEntity,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    seenUniversalIdentifiers: SeenUniversalIdentifiersByMetadataName;
    operation: MetadataSideEffectOperation;
    metadataName: string;
    flatEntity: GenericUniversalFlatEntity;
  }): void {
    const operations = (expandedMatrix[metadataName] ??= {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    });
    const seenByOperation = (seenUniversalIdentifiers[metadataName] ??= {
      flatEntityToCreate: new Set(),
      flatEntityToUpdate: new Set(),
      flatEntityToDelete: new Set(),
    });

    const flatEntityListKey = OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation];
    const seenInOperation = seenByOperation[flatEntityListKey];

    if (seenInOperation.has(flatEntity.universalIdentifier)) {
      return;
    }

    operations[flatEntityListKey].push(flatEntity);
    seenInOperation.add(flatEntity.universalIdentifier);
  }
}
