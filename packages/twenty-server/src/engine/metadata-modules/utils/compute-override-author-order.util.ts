import { isDefined } from 'twenty-shared/utils';

import { type OverrideAuthorContext } from 'src/engine/metadata-modules/utils/override-author-context.type';

export const computeOverrideAuthorOrder = ({
  workspaceCustomApplicationUniversalIdentifier,
  ownerApplicationUniversalIdentifier,
}: OverrideAuthorContext): string[] => [
  ...new Set(
    [
      workspaceCustomApplicationUniversalIdentifier,
      ownerApplicationUniversalIdentifier,
    ].filter(isDefined),
  ),
];
