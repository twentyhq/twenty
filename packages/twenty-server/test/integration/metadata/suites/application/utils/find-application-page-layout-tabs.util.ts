import { findPageLayoutTabs } from 'test/integration/metadata/suites/page-layout-tab/utils/find-page-layout-tabs.util';

import { type PageLayoutTabDTO } from 'src/engine/metadata-modules/page-layout-tab/dtos/page-layout-tab.dto';

const DEFAULT_APPLICATION_PAGE_LAYOUT_TAB_GQL_FIELDS = `
  id
  title
  position
  pageLayoutId
  layoutMode
  applicationId
`;

export const findApplicationPageLayoutTabs = async ({
  pageLayoutId,
  applicationId,
  gqlFields = DEFAULT_APPLICATION_PAGE_LAYOUT_TAB_GQL_FIELDS,
}: {
  pageLayoutId: string;
  applicationId: string;
  gqlFields?: string;
}): Promise<PageLayoutTabDTO[]> => {
  const { data } = await findPageLayoutTabs({
    gqlFields,
    expectToFail: false,
    input: { pageLayoutId },
  });

  return data.getPageLayoutTabs.filter(
    (pageLayoutTab) => pageLayoutTab.applicationId === applicationId,
  );
};
