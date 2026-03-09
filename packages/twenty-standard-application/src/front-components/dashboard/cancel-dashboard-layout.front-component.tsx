import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const CancelDashboardLayout = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'dac81512-3890-4ba5-8471-bd94738ab80a',
  name: 'Cancel dashboard layout edition',
  component: CancelDashboardLayout,
  isHeadless: true,
});
