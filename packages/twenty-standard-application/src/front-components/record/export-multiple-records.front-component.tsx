import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const ExportMultipleRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '05381918-8c9c-421f-ab89-10e365a463f8',
  name: 'Export multiple records',
  component: ExportMultipleRecords,
  isHeadless: true,
});
