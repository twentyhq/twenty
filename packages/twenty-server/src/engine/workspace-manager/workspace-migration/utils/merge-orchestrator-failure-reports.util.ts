import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';

import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

type AnyFailedValidation = FailedFlatEntityValidation<
  AllMetadataName,
  WorkspaceMigrationActionType
>;

export const pushToOrchestratorFailureReport = <
  TMetadataName extends AllMetadataName,
>({
  report,
  metadataName,
  items,
}: {
  report: OrchestratorFailureReport;
  metadataName: TMetadataName;
  items: FailedFlatEntityValidation<
    TMetadataName,
    WorkspaceMigrationActionType
  >[];
}): void => {
  (report[metadataName] as AnyFailedValidation[]).push(...items);
};

export const mergeOrchestratorFailureReports = ({
  target,
  source,
}: {
  target: OrchestratorFailureReport;
  source: OrchestratorFailureReport;
}): void => {
  for (const metadataName of Object.values(ALL_METADATA_NAME)) {
    pushToOrchestratorFailureReport({
      report: target,
      metadataName,
      items: source[metadataName],
    });
  }
};
