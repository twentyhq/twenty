import { ActionOpenSidePanelPage, defineFrontComponent } from 'twenty-sdk';
import { SidePanelPages } from 'twenty-shared/types';

const ViewPreviousAiChats = () => (
  <ActionOpenSidePanelPage
    page={SidePanelPages.ViewPreviousAIChats}
    pageTitle="Previous AI Chats"
    pageIcon="IconHistory"
  />
);

export default defineFrontComponent({
  universalIdentifier: '5e7876fa-7a9b-487f-8e05-1a1c7ce029d9',
  name: 'View previous AI chats',
  component: ViewPreviousAiChats,
  isHeadless: false,
});
