import { ActionOpenSidePanelPage, defineFrontComponent } from 'twenty-sdk';
import { SidePanelPages } from 'twenty-shared/types';

const SearchRecords = () => (
  <ActionOpenSidePanelPage
    page={SidePanelPages.SearchRecords}
    pageTitle="Search"
    pageIcon="IconSearch"
  />
);

export default defineFrontComponent({
  universalIdentifier: '7791c67a-e58d-4a2d-9cfd-58110a04cb8f',
  name: 'Search records',
  component: SearchRecords,
  isHeadless: false,
});
