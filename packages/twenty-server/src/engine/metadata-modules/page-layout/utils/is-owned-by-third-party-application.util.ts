import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

export const isOwnedByThirdPartyApplication = ({
  applicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  applicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean =>
  ![
    workspaceCustomApplicationUniversalIdentifier,
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  ].includes(applicationUniversalIdentifier);
