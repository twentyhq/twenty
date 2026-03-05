import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DestroySingleRecord = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '212d9e7d-e149-417b-9a0f-5024835349e6',
  name: 'Destroy single record',
  component: DestroySingleRecord,
  isHeadless: true,
});
