import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeRunsWorkflowVersion = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '3d673f94-ecf9-4e38-8eac-684cf4cad617',
  name: 'See runs (workflow version)',
  component: SeeRunsWorkflowVersion,
  isHeadless: true,
});
