import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const getWorkspaceCustomApplicationUniversalIdentifierOrThrow = ({
  workspaceCustomApplicationId,
  flatApplicationMaps,
}: {
  workspaceCustomApplicationId: string;
  flatApplicationMaps: {
    byId: Partial<Record<string, Pick<FlatApplication, 'universalIdentifier'>>>;
  };
}): string => {
  const workspaceCustomFlatApplication =
    flatApplicationMaps.byId[workspaceCustomApplicationId];

  if (!isDefined(workspaceCustomFlatApplication)) {
    throw new ApplicationException(
      'Could not find the workspace custom application in the workspace cache',
      ApplicationExceptionCode.APPLICATION_NOT_FOUND,
    );
  }

  return workspaceCustomFlatApplication.universalIdentifier;
};
