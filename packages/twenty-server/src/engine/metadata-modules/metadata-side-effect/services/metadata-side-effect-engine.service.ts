import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataManyToOneRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-many-to-one-related-names.util';
import { getMetadataSideEffectCompanionNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-side-effect-companion-names.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
import { type AllFlatEntityOperationIndexByMetadataName } from 'src/engine/metadata-modules/metadata-side-effect/types/all-flat-entity-operation-index-by-metadata-name.type';
import { type MetadataSideEffectContext } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-context.type';
import { type MetadataSideEffectExpansionResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-expansion-result.type';
import {
  METADATA_SIDE_EFFECT_OPERATIONS,
  type MetadataSideEffectOperation,
} from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-operation.type';
import { type MetadataSideEffectFailure } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';
import { type SystemSideEffectUniversalIdentifierCollision } from 'src/engine/metadata-modules/metadata-side-effect/types/system-side-effect-universal-identifier-collision.type';
import { mapSystemSideEffectCollisionToFailure } from 'src/engine/metadata-modules/metadata-side-effect/utils/map-system-side-effect-collision-to-failure.util';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import { pushToOrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/utils/merge-orchestrator-failure-reports.util';

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

  // The union of flat entity maps every registered handler needs, derived from
  // the side-effect registry. The caller loads exactly these before expansion so
  // each handler receives its typed, non-optional related-maps bundle.
  getRequiredFlatEntityMapsCacheKeys(): (keyof AllFlatEntityMaps)[] {
    const cacheKeys = new Set<keyof AllFlatEntityMaps>();

    for (const {
      metadataName,
    } of this.metadataSideEffectHandlerRegistryService.getRegisteredHandlerKeys()) {
      const relatedMetadataNames = [
        metadataName,
        ...getMetadataManyToOneRelatedNames(metadataName),
        ...getMetadataSideEffectCompanionNames(metadataName),
      ];

      for (const relatedMetadataName of relatedMetadataNames) {
        cacheKeys.add(getMetadataFlatEntityMapsKey(relatedMetadataName));
      }
    }

    return [...cacheKeys];
  }

  expandWithSideEffects({
    allFlatEntityOperationByMetadataName,
    sideEffectRelatedFlatEntityMaps,
    context,
  }: {
    allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
    sideEffectRelatedFlatEntityMaps: Partial<AllFlatEntityMaps>;
    context: MetadataSideEffectContext;
  }): MetadataSideEffectExpansionResult {
    const expandedMatrix: GenericAllFlatEntityOperationByMetadataName =
      this.cloneMatrix(allFlatEntityOperationByMetadataName);
    const seenFlatEntityByUniversalIdentifier =
      this.buildSeenFlatEntityByUniversalIdentifier(expandedMatrix);
    const systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[] =
      [];
    const sideEffectFailures: MetadataSideEffectFailure[] = [];

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
        for (const handler of handlers) {
          const sideEffectResult = handler.buildSideEffects({
            flatEntity:
              triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
            allFlatEntityOperationIndexByMetadataName:
              seenFlatEntityByUniversalIdentifier as unknown as AllFlatEntityOperationIndexByMetadataName,
            relatedFlatEntityMaps:
              sideEffectRelatedFlatEntityMaps as unknown as MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect<AllMetadataName>,
            context,
          });

          if (sideEffectResult.status === 'fail') {
            sideEffectFailures.push(sideEffectResult);
            continue;
          }

          if (sideEffectResult.status === 'noop') {
            continue;
          }

          this.mergeSideEffectsIntoMatrix({
            expandedMatrix,
            seenFlatEntityByUniversalIdentifier,
            sideEffectOperations:
              sideEffectResult.operations as unknown as GenericMetadataSideEffectOperationsByMetadataName,
            systemSideEffectUniversalIdentifierCollisions,
          });
        }
      }
    }

    // Merge both failure sources (reserved-identifier collisions and handler
    // failures) into a single OrchestratorFailureReport, using the same contract
    // as the builder so callers handle every failure through one channel.
    const allSideEffectFailures: MetadataSideEffectFailure[] = [
      ...sideEffectFailures,
      ...systemSideEffectUniversalIdentifierCollisions.map(
        mapSystemSideEffectCollisionToFailure,
      ),
    ];

    if (allSideEffectFailures.length > 0) {
      const report = EMPTY_ORCHESTRATOR_FAILURE_REPORT();

      for (const sideEffectFailure of allSideEffectFailures) {
        pushToOrchestratorFailureReport({
          report,
          metadataName: sideEffectFailure.metadataName,
          items: [sideEffectFailure],
        });
      }

      return {
        status: 'fail',
        report,
      };
    }

    return {
      status: 'success',
      allFlatEntityOperationByMetadataName:
        expandedMatrix as unknown as AllFlatEntityOperationByMetadataName,
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
