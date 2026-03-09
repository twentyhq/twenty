import { CommandOpenSidePanelPage, defineFrontComponent } from 'twenty-sdk';
import { SidePanelPages } from 'twenty-shared/types';

const AskAi = () => (
  <CommandOpenSidePanelPage
    page={SidePanelPages.AskAI}
    pageTitle="Ask AI"
    pageIcon="IconSparkles"
  />
);

export default defineFrontComponent({
  universalIdentifier: '75d8fed0-36d9-4798-afa5-1472ecac0884',
  name: 'Ask AI',
  component: AskAi,
  isHeadless: true,
});
