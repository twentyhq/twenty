import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const TidyUpWorkflow = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '3dac631e-dfb7-4570-ac27-15d98ee8ec43',
  name: 'Tidy up workflow',
  component: TidyUpWorkflow,
  isHeadless: true,
});
