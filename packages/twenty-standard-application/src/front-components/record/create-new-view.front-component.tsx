import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const CreateNewView = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'd7bf58ad-e716-47c1-8c51-209c755c5f27',
  name: 'Create view',
  component: CreateNewView,
  isHeadless: true,
});
