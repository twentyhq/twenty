import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const CreateNewRecord = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '1e6e57bb-89c4-482e-bf44-d62ad1c05d2f',
  name: 'Create new record',
  component: CreateNewRecord,
  isHeadless: true,
});
