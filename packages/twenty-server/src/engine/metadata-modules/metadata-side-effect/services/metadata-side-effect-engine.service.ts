import { Injectable } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { type MetadataFlatEntityAndRelatedFlatEntityMapsForSideEffect } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-side-effect.type';
import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataManyToOneRelatedNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-many-to-one-related-names.util';
import { getMetadataSideEffectCompanionNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-side-effect-companion-names.util';
import { isSystemSideEffectFlatEntity } from 'src/engine/metadata-modules/flat-entity/utils/is-system-side-effect-flat-entity.util';
import { MetadataSideEffectHandlerRegistryService } from 'src/engine/metadata-modules/metadata-side-effect/registry/metadata-side-effect-handler-registry.service';
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
type GenericFlatEntityOperationRecord = {
  flatEntityToCreate: Record<string, GenericUniversalFlatEntity>;
  flatEntityToUpdate: Record<string, GenericUniversalFlatEntity>;
  flatEntityToDelete: Record<string, GenericUniversalFlatEntity>;
};
type GenericAllFlatEntityOperationRecordByMetadataName = Record<
  string,
  GenericFlatEntityOperationRecord | undefined
>;

type GenericPartialFlatEntityOperationRecord = {
  flatEntityToCreate?: Record<string, GenericUniversalFlatEntity>;
  flatEntityToUpdate?: Record<string, GenericUniversalFlatEntity>;
  flatEntityToDelete?: Record<string, GenericUniversalFlatEntity>;
};
type GenericMetadataSideEffectOperationsByMetadataName = Record<
  string,
  GenericPartialFlatEntityOperationRecord | undefined
>;

const OPERATION_TO_FLAT_ENTITY_RECORD_KEY = {
  create: 'flatEntityToCreate',
  update: 'flatEntityToUpdate',
  delete: 'flatEntityToDelete',
} as const satisfies Record<
  MetadataSideEffectOperation,
  keyof GenericFlatEntityOperationRecord
>;

@Injectable()
export class MetadataSideEffectEngineService {
  constructor(
    private readonly metadataSideEffectHandlerRegistryService: MetadataSideEffectHandlerRegistryService,
  ) {}

  getSideEffectRelatedMetadataNames(
    triggerMetadataNames: AllMetadataName[],
  ): AllMetadataName[] {
    const relatedMetadataNames = new Set<AllMetadataName>();

    for (const {
      metadataName,
    } of this.metadataSideEffectHandlerRegistryService.getRegisteredHandlerKeys()) {
      if (!triggerMetadataNames.includes(metadataName)) {
        continue;
      }

      for (const relatedMetadataName of [
        metadataName,
        ...getMetadataManyToOneRelatedNames(metadataName),
        ...getMetadataSideEffectCompanionNames(metadataName),
      ]) {
        relatedMetadataNames.add(relatedMetadataName);
      }
    }

    return [...relatedMetadataNames];
  }

  expandWithSideEffects({
    allFlatEntityOperationRecordByMetadataName,
    sideEffectRelatedFlatEntityMaps,
    context,
  }: {
    allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
    sideEffectRelatedFlatEntityMaps: Partial<AllFlatEntityMaps>;
    context: MetadataSideEffectContext;
  }): MetadataSideEffectExpansionResult {
    const expandedMatrix = this.cloneMatrix(
      allFlatEntityOperationRecordByMetadataName,
    );
    const systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[] =
      [];
    const sideEffectFailures: MetadataSideEffectFailure[] = [];

    const triggerMatrix =
      allFlatEntityOperationRecordByMetadataName as unknown as GenericAllFlatEntityOperationRecordByMetadataName;

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

      const triggerFlatEntities = Object.values(
        triggerMatrix[metadataName]?.[
          OPERATION_TO_FLAT_ENTITY_RECORD_KEY[operation]
        ] ?? {},
      );

      for (const triggerFlatEntity of triggerFlatEntities) {
        for (const handler of handlers) {
          const sideEffectResult = handler.buildSideEffects({
            flatEntity:
              triggerFlatEntity as unknown as MetadataUniversalFlatEntity<AllMetadataName>,
            allFlatEntityOperationRecordByMetadataName:
              expandedMatrix as unknown as AllFlatEntityOperationRecordByMetadataName,
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
            sideEffectOperations:
              sideEffectResult.operations as unknown as GenericMetadataSideEffectOperationsByMetadataName,
            systemSideEffectUniversalIdentifierCollisions,
          });
        }
      }
    }

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
      allFlatEntityOperationRecordByMetadataName:
        expandedMatrix as unknown as AllFlatEntityOperationRecordByMetadataName,
    };
  }

  private mergeSideEffectsIntoMatrix({
    expandedMatrix,
    sideEffectOperations,
    systemSideEffectUniversalIdentifierCollisions,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationRecordByMetadataName;
    sideEffectOperations: GenericMetadataSideEffectOperationsByMetadataName;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
  }): void {
    for (const metadataName of Object.keys(sideEffectOperations)) {
      const operationBuckets = sideEffectOperations[metadataName];

      if (!isDefined(operationBuckets)) {
        continue;
      }

      for (const operation of METADATA_SIDE_EFFECT_OPERATIONS) {
        const sideEffectFlatEntities = Object.values(
          operationBuckets[OPERATION_TO_FLAT_ENTITY_RECORD_KEY[operation]] ??
            {},
        );

        for (const sideEffectFlatEntity of sideEffectFlatEntities) {
          this.addToOperationIfAbsent({
            expandedMatrix,
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
    allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName,
  ): GenericAllFlatEntityOperationRecordByMetadataName {
    const genericMatrix =
      allFlatEntityOperationRecordByMetadataName as unknown as GenericAllFlatEntityOperationRecordByMetadataName;
    const clonedMatrix: GenericAllFlatEntityOperationRecordByMetadataName = {};

    for (const metadataName of Object.keys(genericMatrix)) {
      const operations = genericMatrix[metadataName];

      if (!isDefined(operations)) {
        continue;
      }

      clonedMatrix[metadataName] = {
        flatEntityToCreate: { ...operations.flatEntityToCreate },
        flatEntityToUpdate: { ...operations.flatEntityToUpdate },
        flatEntityToDelete: { ...operations.flatEntityToDelete },
      };
    }

    return clonedMatrix;
  }

  private addToOperationIfAbsent({
    expandedMatrix,
    operation,
    metadataName,
    flatEntity,
    systemSideEffectUniversalIdentifierCollisions,
  }: {
    expandedMatrix: GenericAllFlatEntityOperationRecordByMetadataName;
    operation: MetadataSideEffectOperation;
    metadataName: string;
    flatEntity: GenericUniversalFlatEntity;
    systemSideEffectUniversalIdentifierCollisions: SystemSideEffectUniversalIdentifierCollision[];
  }): void {
    const operations = (expandedMatrix[metadataName] ??= {
      flatEntityToCreate: {},
      flatEntityToUpdate: {},
      flatEntityToDelete: {},
    });

    const flatEntityRecordKey = OPERATION_TO_FLAT_ENTITY_RECORD_KEY[operation];
    const flatEntityRecord = operations[flatEntityRecordKey];

    const existingFlatEntity = flatEntityRecord[flatEntity.universalIdentifier];

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

    flatEntityRecord[flatEntity.universalIdentifier] = flatEntity;
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
