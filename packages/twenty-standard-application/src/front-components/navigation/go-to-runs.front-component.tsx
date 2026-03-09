import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToRuns = () => (
  <CommandLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'workflowRuns' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: '0bd0ccfc-1909-4d19-b694-610878f07a3a',
  name: 'Go to runs',
  component: GoToRuns,
  isHeadless: true,
});
