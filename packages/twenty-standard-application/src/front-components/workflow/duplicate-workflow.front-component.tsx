import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DuplicateWorkflow = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '566a48c5-5342-446f-a041-9db59bcdab6b',
  name: 'Duplicate workflow',
  component: DuplicateWorkflow,
  isHeadless: true,
});
