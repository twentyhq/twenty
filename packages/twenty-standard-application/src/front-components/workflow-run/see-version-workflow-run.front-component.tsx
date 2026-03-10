import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeVersionWorkflowRun = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '2e09d6b0-60c3-447c-8d5d-1af70a2d037b',
  name: 'See version (workflow run)',
  component: SeeVersionWorkflowRun,
  isHeadless: true,
});
