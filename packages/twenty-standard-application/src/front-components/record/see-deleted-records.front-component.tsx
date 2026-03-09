import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeDeletedRecords = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'dad2327b-9020-4d13-a38c-14d1207e66fc',
  name: 'See deleted records',
  component: SeeDeletedRecords,
  isHeadless: true,
});
