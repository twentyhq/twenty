import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DuplicateDashboard = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'e2bec30e-a6b0-47ff-9708-45855ae96fe7',
  name: 'Duplicate dashboard',
  component: DuplicateDashboard,
  isHeadless: true,
});
