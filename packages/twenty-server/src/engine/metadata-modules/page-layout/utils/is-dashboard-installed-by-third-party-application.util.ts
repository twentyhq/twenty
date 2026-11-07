import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { PageLayoutType } from 'twenty-shared/types';

import { type FlatPageLayout } from 'src/engine/metadata-modules/flat-page-layout/types/flat-page-layout.type';

export const isDashboardInstalledByThirdPartyApplication = ({
  pageLayout: { type, applicationUniversalIdentifier },
  workspaceCustomApplicationUniversalIdentifier,
}: {
  pageLayout: Pick<FlatPageLayout, 'type' | 'applicationUniversalIdentifier'>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): boolean =>
  type === PageLayoutType.DASHBOARD &&
  ![
    workspaceCustomApplicationUniversalIdentifier,
    TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
  ].includes(applicationUniversalIdentifier);
