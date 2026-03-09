import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const RestoreSingleRecord = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '88262225-1253-4dfe-9bf7-563b73e6d9ea',
  name: 'Restore single record',
  component: RestoreSingleRecord,
  isHeadless: true,
});
