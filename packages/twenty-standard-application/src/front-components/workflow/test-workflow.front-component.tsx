import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const TestWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '39e9aa5a-cacc-4543-9053-f1fbf923e170',
  name: 'Test workflow',
  component: TestWorkflow,
  isHeadless: true,
});
