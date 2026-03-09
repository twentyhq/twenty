import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeActiveVersionWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '6259a4a5-428e-41b9-a032-333c2d51e15f',
  name: 'See active version',
  component: SeeActiveVersionWorkflow,
  isHeadless: true,
});
