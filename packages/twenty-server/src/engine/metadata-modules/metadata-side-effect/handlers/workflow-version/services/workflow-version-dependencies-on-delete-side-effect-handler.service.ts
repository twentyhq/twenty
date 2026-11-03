import { Injectable } from '@nestjs/common';

import { buildWorkflowVersionDependenciesDeleteSideEffects } from 'src/engine/metadata-modules/metadata-side-effect/handlers/workflow-version/utils/build-workflow-version-dependencies-delete-side-effects.util';
import {
  type BuildSideEffectsArgs,
  MetadataSideEffectHandler,
} from 'src/engine/metadata-modules/metadata-side-effect/interfaces/base-metadata-side-effect-handler.service';
import { type MetadataSideEffectResult } from 'src/engine/metadata-modules/metadata-side-effect/types/metadata-side-effect-result.type';

@Injectable()
export class WorkflowVersionDependenciesOnDeleteSideEffectHandlerService extends MetadataSideEffectHandler(
  {
    operation: 'delete',
    metadataName: 'workflowVersion',
    name: 'workflowVersionDependenciesOnDelete',
    description:
      'Delete the command menu items of a deleted workflow version and the CODE step logic functions only it uses, unless its workflow is deleted too.',
  },
) {
  buildSideEffects(
    args: BuildSideEffectsArgs<'workflowVersion'>,
  ): MetadataSideEffectResult {
    return buildWorkflowVersionDependenciesDeleteSideEffects(args);
  }
}
