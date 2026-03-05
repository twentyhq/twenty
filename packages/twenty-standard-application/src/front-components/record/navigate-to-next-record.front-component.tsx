import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const NavigateToNextRecord = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'aec12b85-29df-465f-a329-1c72c81ed95c',
  name: 'Navigate to next record',
  component: NavigateToNextRecord,
  isHeadless: true,
});
