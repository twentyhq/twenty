import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DeleteMultipleRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '35c25fd2-6060-440a-b734-aa3016c11f47',
  name: 'Delete multiple records',
  component: DeleteMultipleRecords,
  isHeadless: true,
});
