import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DiscardDraftWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '972dc871-7f9c-4035-957c-e6662f4df7c5',
  name: 'Discard draft workflow',
  component: DiscardDraftWorkflow,
  isHeadless: true,
});
