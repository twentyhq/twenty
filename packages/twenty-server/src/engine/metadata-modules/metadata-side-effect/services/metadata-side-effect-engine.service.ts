import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
import { type AllFlatEntityOperationIndexByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/all-flat-entity-operation-index-by-metadata-name.type';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import {
  METADATA_SIDE_EFFECT_OPERATIONS,
  type MetadataSideEffectOperation,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';
import { type SystemSideEffectUniversalIdentifierCollision } from 'src/engine/metadata-modules/metadata-side-effect/types/system-side-effect-universal-identifier-collision.type';

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

type SeenFlatEntityByUniversalIdentifierByOperation = {
  flatEntityToCreate: Map<string, GenericUniversalFlatEntity>;
  flatEntityToUpdate: Map<string, GenericUniversalFlatEntity>;
  flatEntityToDelete: Map<string, GenericUniversalFlatEntity>;
};
type SeenFlatEntityByUniversalIdentifierByMetadataName = Record<
  string,
  SeenFlatEntityByUniversalIdentifierByOperation | undefined
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
  }): {
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
  } {
    const expandedMatrix: GenericAllFlatEntityOperationByMetadataName =
      this.cloneMatrix(allFlatEntityOperationByMetadataName);
    const seenFlatEntityByUniversalIdentifier =
      this.buildSeenFlatEntityByUniversalIdentifier(expandedMatrix);
    const systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[] =
      [];

    const triggerMatrix =
      allFlatEntityOperationByMetadataName as unknown as GenericAllFlatEntityOperationByMetadataName;

    for (const {
      operation,
      metadataName,
    } of this.metadataSideEffectHandlerRegistryService.getRegisteredHandlerKeys()) {
      const handlers =
        this.metadataSideEffectHandlerRegistryService.getHandlers(
          operation,
          metadataName,
        );

      if (handlers.length === 0) {
        continue;
      }

      const triggerFlatEntities =
        triggerMatrix[metadataName]?.[
          OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation]
        ] ?? [];

      for (const triggerFlatEntity of triggerFlatEntities) {
        // A system-side-effect entity's create/delete is owned atomically by its
        // parent side effect (e.g. object creation brings along its system fields
        // and their backing indexes), so re-triggering there would duplicate or
        // conflict with parent-managed companions (e.g. generating an invalid
        // UNIQUE index for the `id` UUID primary key). An `update`, however, is a
        // standalone caller intent (e.g. flipping `isUnique` on the auto-created
        // `name` field) that must still reconcile its dependent side effects.
        if (
          operation !== 'update' &&
          isSystemSideEffectFlatEntity(
            triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
          )
        ) {
          continue;
        }

        for (const handler of handlers) {
          const sideEffectOperations = handler.buildSideEffects({
            flatEntity:
              triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
            allFlatEntityOperationIndexByMetadataName:
              seenFlatEntityByUniversalIdentifier as unknown as AllFlatEntityOperationIndexByMetadataName,
            context,
          }) as unknown as GenericMetadataSideEffectOperationsByMetadataName;

          this.mergeSideEffectsIntoMatrix({
            expandedMatrix,
            seenFlatEntityByUniversalIdentifier,
            sideEffectOperations,
            systemSideEffectUniversalIdentifierCollisions,
          });
        }
      }
    }

    return {
      allFlatEntityOperationByMetadataName:
        expandedMatrix as unknown as AllFlatEntityOperationByMetadataName,
      systemSideEffectUniversalIdentifierCollisions,
    };
  }

  private mergeSideEffectsIntoMatrix({
    expandedMatrix,
    seenFlatEntityByUniversalIdentifier,
    sideEffectOperations,
    systemSideEffectUniversalIdentifierCollisions,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    seenFlatEntityByUniversalIdentifier: SeenFlatEntityByUniversalIdentifierByMetadataName;
    sideEffectOperations: GenericMetadataSideEffectOperationsByMetadataName;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
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
            seenFlatEntityByUniversalIdentifier,
            operation,
            metadataName,
            flatEntity: sideEffectFlatEntity,
            systemSideEffectUniversalIdentifierCollisions,
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

  private buildSeenFlatEntityByUniversalIdentifier(
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName,
  ): SeenFlatEntityByUniversalIdentifierByMetadataName {
    const seenFlatEntityByUniversalIdentifier: SeenFlatEntityByUniversalIdentifierByMetadataName =
      {};

    for (const metadataName of Object.keys(expandedMatrix)) {
      const operations = expandedMatrix[metadataName];

      if (!isDefined(operations)) {
        continue;
      }

      seenFlatEntityByUniversalIdentifier[metadataName] = {
        flatEntityToCreate: this.toFlatEntityByUniversalIdentifierMap(
          operations.flatEntityToCreate,
        ),
        flatEntityToUpdate: this.toFlatEntityByUniversalIdentifierMap(
          operations.flatEntityToUpdate,
        ),
        flatEntityToDelete: this.toFlatEntityByUniversalIdentifierMap(
          operations.flatEntityToDelete,
        ),
      };
    }

    return seenFlatEntityByUniversalIdentifier;
  }

  private toFlatEntityByUniversalIdentifierMap(
    flatEntities: GenericUniversalFlatEntity[],
  ): Map<string, GenericUniversalFlatEntity> {
    return new Map(
      flatEntities.map((flatEntity) => [
        flatEntity.universalIdentifier,
        flatEntity,
      ]),
    );
  }

  private addToOperationIfAbsent({
    expandedMatrix,
    seenFlatEntityByUniversalIdentifier,
    operation,
    metadataName,
    flatEntity,
    systemSideEffectUniversalIdentifierCollisions,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationByMetadataName;
    seenFlatEntityByUniversalIdentifier: SeenFlatEntityByUniversalIdentifierByMetadataName;
    operation: MetadataSideEffectOperation;
    metadataName: string;
    flatEntity: GenericUniversalFlatEntity;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
  }): void {
    const operations = (expandedMatrix[metadataName] ??= {
      flatEntityToCreate: [],
      flatEntityToUpdate: [],
      flatEntityToDelete: [],
    });
    const seenByOperation = (seenFlatEntityByUniversalIdentifier[
      metadataName
    ] ??= {
      flatEntityToCreate: new Map(),
      flatEntityToUpdate: new Map(),
      flatEntityToDelete: new Map(),
    });

    const flatEntityListKey = OPERATION_TO_FLAT_ENTITY_LIST_KEY[operation];
    const seenInOperation = seenByOperation[flatEntityListKey];

    const existingFlatEntity = seenInOperation.get(
      flatEntity.universalIdentifier,
    );

    if (isDefined(existingFlatEntity)) {
      this.recordUniversalIdentifierCollisionIfNeeded({
        existingFlatEntity,
        operation,
        metadataName,
        flatEntity,
        systemSideEffectUniversalIdentifierCollisions,
      });

      return;
    }

    operations[flatEntityListKey].push(flatEntity);
    seenInOperation.set(flatEntity.universalIdentifier, flatEntity);
  }

  private recordUniversalIdentifierCollisionIfNeeded({
    existingFlatEntity,
    operation,
    metadataName,
    flatEntity,
    systemSideEffectUniversalIdentifierCollisions,
  }: {
    existingFlatEntity: GenericUniversalFlatEntity;
    operation: MetadataSideEffectOperation;
    metadataName: string;
    flatEntity: GenericUniversalFlatEntity;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
  }): void {
    const isIncomingSystemSideEffect = isSystemSideEffectFlatEntity(
      flatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
    );

    if (!isIncomingSystemSideEffect) {
      return;
    }

    if (
      isSystemSideEffectFlatEntity(
        existingFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
      )
    ) {
      return;
    }

    systemSideEffectUniversalIdentifierCollisions.push({
      metadataName: metadataName as AllMetadataName,
      operation,
      universalIdentifier: flatEntity.universalIdentifier,
      name: this.extractFlatEntityName(flatEntity),
    });
  }

  private extractFlatEntityName(
    flatEntity: GenericUniversalFlatEntity,
  ): string | undefined {
    const { name } = flatEntity as { name?: unknown };

    return typeof name === 'string' ? name : undefined;
  }
}
