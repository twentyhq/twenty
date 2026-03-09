import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const HideDeletedRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '75e93e21-effb-48ef-ba1c-588c358fd56f',
  name: 'Hide deleted records',
  component: HideDeletedRecords,
  isHeadless: true,
});
