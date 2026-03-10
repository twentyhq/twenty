import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToWorkflows = () => (
  <CommandLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'workflows' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: '9d313f79-170f-47cc-b9c4-a2076a86232f',
  name: 'Go to Workflows',
  component: GoToWorkflows,
  isHeadless: true,
});
