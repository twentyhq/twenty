import {
  FrontComponentException,
  FrontComponentExceptionCode,
} from 'src/engine/metadata-modules/front-component/front-component.exception';
import { isDefined } from 'twenty-shared/utils';

import { type FrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-shared-dependencies.type';
import { buildFrontComponentSharedDependencies } from 'src/engine/metadata-modules/ai/ai-front-component/utils/build-front-component-shared-dependencies.util';

let sharedDependencies: Promise<FrontComponentSharedDependencies> | undefined;

export const getFrontComponentSharedDependencies =
  (): Promise<FrontComponentSharedDependencies> => {
    if (!isDefined(sharedDependencies)) {
      sharedDependencies = buildFrontComponentSharedDependencies().catch(
        (error: unknown) => {
          sharedDependencies = undefined;
          throw new FrontComponentException(
            `Unable to build the shared frontend component dependencies: ${error instanceof Error ? error.message : String(error)}`,
            FrontComponentExceptionCode.FRONT_COMPONENT_CREATE_FAILED,
          );
        },
      );
    }

    return sharedDependencies;
  };
