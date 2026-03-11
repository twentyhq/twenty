import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToOpportunities = () => (
  <CommandLink to={AppPath.OpportunitiesPage} />
);

export default defineFrontComponent({
  universalIdentifier: 'ebb4c2ca-6b70-4d2e-8919-79475a278273',
  name: 'Go to Opportunities',
  component: GoToOpportunities,
  isHeadless: true,
});
