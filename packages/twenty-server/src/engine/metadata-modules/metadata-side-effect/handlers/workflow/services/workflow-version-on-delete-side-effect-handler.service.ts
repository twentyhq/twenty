import { Injectable } from '@nestjs/common';

import { buildWorkflowVersionDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-delete-side-effects.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class WorkflowVersionOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'workflow',
    name: 'workflowVersionOnDelete',
    description:
      'Delete the managed version of an application workflow when the workflow is deleted.',
  },
) {
  buildSideEffects(
    args: BuildSideEffectsArgs<'workflow'>,
  ): MetadataSideEffectResult {
    return buildWorkflowVersionDeleteSideEffects(args);
  }
}
