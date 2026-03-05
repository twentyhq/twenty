import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const UseAsDraftWorkflowVersion = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'cb11ab5c-974a-4942-bb8a-77efa6b5bb26',
  name: 'Use as draft (workflow version)',
  component: UseAsDraftWorkflowVersion,
  isHeadless: true,
});
