import { Action, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const SeeRunsWorkflow = () => <Action execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: 'b8fa3327-e5c4-43f4-a3ac-c17d26af0847',
  name: 'See runs',
  component: SeeRunsWorkflow,
  isHeadless: true,
});
