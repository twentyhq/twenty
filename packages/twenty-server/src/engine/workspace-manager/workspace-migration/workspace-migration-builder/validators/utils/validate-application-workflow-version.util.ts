import { msg } from '@lingui/core/macro';
import { APPLICATION_WORKFLOW_TRIGGER_TYPES } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  buildWorkflowGraph,
  validateWorkflowGraph,
  validateWorkflowExecutionPaths,
  validateWorkflowVariableReferences,
} from 'twenty-shared/workflow';

import { CoreWorkflowMetadataExceptionCode } from 'src/engine/core-modules/workflow/exceptions/core-workflow-metadata.exception';
import { type UniversalFlatWorkflowVersion } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-workflow-version.type';
import { type FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';

export const validateApplicationWorkflowVersion = ({
  version,
}: {
  version: UniversalFlatWorkflowVersion;
}): FlatEntityValidationError[] => {
  if (!version.isSystemSideEffect) {
    return [];
  }

  const trigger = version.triggers?.[0];
  const steps = version.steps ?? [];
  const messages: string[] = [];

  if (
    !isDefined(trigger) ||
    version.triggers?.length !== 1 ||
    !APPLICATION_WORKFLOW_TRIGGER_TYPES.includes(trigger.type)
  ) {
    messages.push(
      `Application workflows require one trigger of type ${APPLICATION_WORKFLOW_TRIGGER_TYPES.join(', ')}`,
    );
  } else {
    const identities = [
      version.universalIdentifier,
      'universalIdentifier' in trigger
        ? trigger.universalIdentifier
        : undefined,
      ...steps.map((step) => step.id),
    ].filter(isDefined);
    if (new Set(identities).size !== identities.length) {
      messages.push(
        'Version, trigger and steps must have distinct universal identifiers',
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

  return messages.map((message) => ({
    code: CoreWorkflowMetadataExceptionCode.INVALID_WORKFLOW_VERSION_DEFINITION,
    message,
    userFriendlyMessage: msg`The application workflow definition is invalid.`,
  }));
};
