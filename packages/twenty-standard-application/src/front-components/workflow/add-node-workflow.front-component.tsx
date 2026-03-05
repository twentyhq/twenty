import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const AddNodeWorkflow = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'da1e499c-1298-4ec4-9a7b-5f2276075888',
  name: 'Add a node',
  component: AddNodeWorkflow,
  isHeadless: true,
});
