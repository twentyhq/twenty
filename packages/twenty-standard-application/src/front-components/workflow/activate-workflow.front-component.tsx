import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const ActivateWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '97b89dc4-cef9-4439-9358-35c98616eb1e',
  name: 'Activate workflow',
  component: ActivateWorkflow,
  isHeadless: true,
});
