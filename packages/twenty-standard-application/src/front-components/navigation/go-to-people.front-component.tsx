import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToPeople = () => (
  <CommandLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'people' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: '5a5c1e43-9fb5-49bf-bcde-355973f913b9',
  name: 'Go to People',
  component: GoToPeople,
  isHeadless: true,
});
