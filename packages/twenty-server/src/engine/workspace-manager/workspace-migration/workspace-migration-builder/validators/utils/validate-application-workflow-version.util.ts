import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import {
  buildWorkflowGraph,
  validateWorkflowGraph,
  validateWorkflowExecutionPaths,
  validateWorkflowVariableReferences,
} from 'twenty-shared/workflow';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';
import { type MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { validateWorkflowVersionRecordFields } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-workflow-version-record-fields.util';

export const validateApplicationWorkflowVersion = ({
  version,
  relatedFlatEntityMaps,
}: {
  version: UniversalFlatWorkflowVersion;
  relatedFlatEntityMaps: MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<'workflowVersion'>;
}): FlatEntityValidationError[] => {
  if (version.isSystemSideEffect !== true) {
    return [];
  }

  const trigger = version.triggers?.[0];
  const steps = version.steps ?? [];
  const messages: string[] = [];
  const workflow = Object.values(
    relatedFlatEntityMaps.flatWorkflowMaps.byUniversalIdentifier,
  ).find(
    (candidate) =>
      isDefined(candidate) &&
      'id' in candidate &&
      candidate.id === version.coreWorkflowId,
  );

  if (!isDefined(workflow)) {
    messages.push(
      'The application workflow version must belong to an existing workflow',
    );
  }

  if (
    !isDefined(trigger) ||
    version.triggers?.length !== 1 ||
    trigger.type !== 'MANUAL'
  ) {
    messages.push('Application workflows require one manual trigger');
  } else {
    const identities = [
      workflow?.universalIdentifier,
      version.universalIdentifier,
      'universalIdentifier' in trigger
        ? trigger.universalIdentifier
        : undefined,
      ...steps.map((step) => step.id),
    ].filter(isDefined);
    if (new Set(identities).size !== identities.length) {
      messages.push(
        'Workflow, version, trigger and steps must have distinct universal identifiers',
      );
    }
    const content = { trigger, steps };
    const graph = buildWorkflowGraph(content);
    messages.push(
      ...[
        ...validateWorkflowGraph({ workflow: content, graph }),
        ...validateWorkflowExecutionPaths({ workflow: content, graph }),
        ...validateWorkflowVariableReferences({
          workflow: content,
          graph,
          stepsById: new Map(steps.map((step) => [step.id, step])),
        }),
      ]
        .filter((issue) => issue.severity === 'error')
        .map((issue) => issue.message),
    );
  }

  for (const step of steps) {
    messages.push(
      ...validateWorkflowVersionRecordFields({
        step,
        ...relatedFlatEntityMaps,
      }),
    );
  }

  return messages.map((message) => ({
    code: CoreWorkflowMetadataExceptionCode.INVALID_WORKFLOW_VERSION_DEFINITION,
    message,
    userFriendlyMessage: msg`The application workflow definition is invalid.`,
  }));
};
