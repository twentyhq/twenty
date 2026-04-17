import { ALL_METADATA_NAME } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMapsExceptionCode } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { buildAllUniversalIdentifierMap } from 'src/engine/workspace-manager/workspace-migration/utils/build-all-universal-identifier-map.util';
import { pushToOrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/utils/merge-orchestrator-failure-reports.util';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validateUniversalIdentifierCrossEntityUniquenessThroughReportMutation =
  ({
    optimisticUniversalFlatMaps,
    orchestratorActionsReport,
    orchestratorFailureReport,
  }: {
    optimisticUniversalFlatMaps: AllUniversalFlatEntityMaps;
    orchestratorActionsReport: OrchestratorActionsReport;
    orchestratorFailureReport: OrchestratorFailureReport;
  }): void => {
    const allUniversalIdentifierMap = buildAllUniversalIdentifierMap(
      optimisticUniversalFlatMaps,
    );

    for (const metadataName of Object.values(ALL_METADATA_NAME)) {
      const createActions = orchestratorActionsReport[metadataName]?.create;

      if (!isDefined(createActions) || createActions.length === 0) {
        continue;
      }

      for (const createAction of createActions) {
        const universalIdentifier = createAction.flatEntity
          .universalIdentifier as string;

        const existingOwner =
          allUniversalIdentifierMap.get(universalIdentifier);

        if (!existingOwner || existingOwner.metadataName === metadataName) {
          continue;
        }

        const failedValidation = getEmptyFlatEntityValidationError({
          flatEntityMinimalInformation: {
            universalIdentifier,
          },
          metadataName,
          type: 'create',
        });

        failedValidation.errors.push({
          code: FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
          message: `Cannot create ${metadataName}: universalIdentifier "${universalIdentifier}" is already taken by ${existingOwner.metadataName} from application "${existingOwner.applicationUniversalIdentifier}"`,
        });

        pushToOrchestratorFailureReport({
          report: orchestratorFailureReport,
          metadataName,
          items: [failedValidation],
        });
      }
    }
  };
