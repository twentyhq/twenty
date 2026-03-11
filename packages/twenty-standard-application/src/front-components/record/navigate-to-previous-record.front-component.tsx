import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const NavigateToPreviousRecord = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'b53c54b9-152a-4100-975c-1bc582bfb951',
  name: 'Navigate to previous record',
  component: NavigateToPreviousRecord,
  isHeadless: true,
});
