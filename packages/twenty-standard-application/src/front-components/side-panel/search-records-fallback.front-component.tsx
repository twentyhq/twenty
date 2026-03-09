import { ActionOpenSidePanelPage, defineFrontComponent } from 'twenty-sdk';
import { SidePanelPages } from 'twenty-shared/types';

const SearchRecordsFallback = () => (
  <ActionOpenSidePanelPage
    page={SidePanelPages.SearchRecords}
    pageTitle="Search"
    pageIcon="IconSearch"
  />
);

export default defineFrontComponent({
  universalIdentifier: '7f7fc9f2-0291-4264-a789-d21e8f1c774e',
  name: 'Search records fallback',
  component: SearchRecordsFallback,
  isHeadless: false,
});
