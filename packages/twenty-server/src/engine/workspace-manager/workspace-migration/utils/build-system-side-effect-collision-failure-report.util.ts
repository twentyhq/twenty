import { msg, t } from '@lingui/core/macro';
import { type AllMetadataName } from 'twenty-shared/metadata';

import { type MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataSideEffectExceptionCode } from 'src/engine/metadata-modules/metadata-side-effect/exceptions/metadata-side-effect-exception-code';
import { type SystemSideEffectUniversalIdentifierCollision } from 'src/engine/metadata-modules/metadata-side-effect/types/system-side-effect-universal-identifier-collision.type';
import { EMPTY_ORCHESTRATOR_FAILURE_REPORT } from 'src/engine/workspace-manager/workspace-migration/constant/empty-orchestrator-failure-report.constant';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { pushToOrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/utils/merge-orchestrator-failure-reports.util';

export const buildSystemSideEffectCollisionFailureReport = (
  collisions: SystemSideEffectUniversalIdentifierCollision[],
): OrchestratorFailureReport => {
  const report = EMPTY_ORCHESTRATOR_FAILURE_REPORT();

  for (const collision of collisions) {
    const flatEntityMinimalInformation = {
      universalIdentifier: collision.universalIdentifier,
      ...(collision.name !== undefined ? { name: collision.name } : {}),
    } as Partial<MetadataFlatEntity<AllMetadataName>>;

    pushToOrchestratorFailureReport({
      report,
      metadataName: collision.metadataName,
      items: [
        {
          type: collision.operation,
          metadataName: collision.metadataName,
          flatEntityMinimalInformation,
          errors: [
            {
              code: MetadataSideEffectExceptionCode.RESERVED_SYSTEM_UNIVERSAL_IDENTIFIER,
              message: t`Universal identifier is reserved for system-managed metadata`,
              userFriendlyMessage: msg`This identifier is reserved by the system`,
            },
          ],
        },
      ],
    });
  }

  return report;
};
