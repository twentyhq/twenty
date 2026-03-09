import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const DestroyMultipleRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'f647d17d-b4ae-4a4c-99a9-4e5e4e3068a2',
  name: 'Destroy multiple records',
  component: DestroyMultipleRecords,
  isHeadless: true,
});
