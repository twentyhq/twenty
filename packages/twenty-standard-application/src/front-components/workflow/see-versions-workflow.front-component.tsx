import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeVersionsWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '62f41c00-629f-400d-85f8-d532d76c7879',
  name: 'See versions history',
  component: SeeVersionsWorkflow,
  isHeadless: true,
});
