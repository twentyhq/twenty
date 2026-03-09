import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const ExportView = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '012dc64f-ad2b-419a-98ea-d0019ff3d56d',
  name: 'Export view',
  component: ExportView,
  isHeadless: true,
});
