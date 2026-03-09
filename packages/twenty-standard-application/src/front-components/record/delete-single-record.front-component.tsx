import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DeleteSingleRecord = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'cbc7e92f-d4fe-4956-ba66-a81b7f9713c6',
  name: 'Delete single record',
  component: DeleteSingleRecord,
  isHeadless: true,
});
