import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DeactivateWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'cbf92077-1892-47e0-9435-14ea8f50a510',
  name: 'Deactivate workflow',
  component: DeactivateWorkflow,
  isHeadless: true,
});
