import { type PageLayoutType } from 'twenty-shared/types';

import { type FrontComponentQuery } from 'src/engine/metadata-modules/ai/ai-front-component/types/front-component-query.type';

export type FrontComponentBuildInput = {
  componentId: string;
  name: string;
  source: string;
  query: FrontComponentQuery;
  pageLayoutType: PageLayoutType.DASHBOARD | PageLayoutType.RECORD_PAGE;
};
