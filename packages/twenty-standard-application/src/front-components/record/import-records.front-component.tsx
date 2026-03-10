import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const ImportRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'acfd8025-36d1-4a35-9508-a0422e53d380',
  name: 'Import records',
  component: ImportRecords,
  isHeadless: true,
});
