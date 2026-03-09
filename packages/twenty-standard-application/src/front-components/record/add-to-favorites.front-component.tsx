import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const AddToFavorites = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '5694b053-1f42-416c-a26a-375f826aa9b3',
  name: 'Add to favorites',
  component: AddToFavorites,
  isHeadless: true,
});
