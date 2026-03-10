import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const RestoreMultipleRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '105ff959-838c-44bc-8a92-60d61093ebc4',
  name: 'Restore multiple records',
  component: RestoreMultipleRecords,
  isHeadless: true,
});
