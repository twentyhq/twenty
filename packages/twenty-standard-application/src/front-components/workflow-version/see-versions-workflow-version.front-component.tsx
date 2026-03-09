import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeVersionsWorkflowVersion = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'a93c9f09-7a7f-4665-982a-0709a652c5bd',
  name: 'See versions history (workflow version)',
  component: SeeVersionsWorkflowVersion,
  isHeadless: true,
});
