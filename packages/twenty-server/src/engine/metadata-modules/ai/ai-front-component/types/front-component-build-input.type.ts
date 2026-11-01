import { type PageLayoutType } from 'twenty-shared/types';

export type FrontComponentBuildInput = {
  componentId: string;
  name: string;
  source: string;
  pageLayoutType: PageLayoutType.DASHBOARD | PageLayoutType.RECORD_PAGE;
};
