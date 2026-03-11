import { Command, defineFrontComponent } from 'twenty-sdk';

// TODO: implement execute logic
const RemoveFromFavorites = () => <Command execute={async () => {}} />;

export default defineFrontComponent({
  universalIdentifier: '21105d6a-33a2-4ae3-8edb-c33c38d2e091',
  name: 'Remove from favorites',
  component: RemoveFromFavorites,
  isHeadless: true,
});
