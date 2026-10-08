import { Injectable } from '@nestjs/common';

import { buildWorkflowVersionSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow/utils/build-workflow-version-side-effects.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class WorkflowVersionOnUpdateSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'update',
    metadataName: 'workflow',
    name: 'workflowVersionOnUpdate',
    description:
      'Synchronize the managed version carried by an application workflow definition.',
  },
) {
  buildSideEffects(
    args: BuildSideEffectsArgs<'workflow'>,
  ): MetadataSideEffectResult {
    return buildWorkflowVersionSideEffects(args);
  }
}
