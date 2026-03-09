import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const StopWorkflowRun = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '110fb676-2a09-4ac0-bd19-7261bc588967',
  name: 'Stop workflow run',
  component: StopWorkflowRun,
  isHeadless: true,
});
