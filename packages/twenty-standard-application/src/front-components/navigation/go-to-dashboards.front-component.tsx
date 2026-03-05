import { ActionLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToDashboards = () => (
  <ActionLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'dashboards' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: 'c71cc879-50af-4e20-9bdc-52f90c9862ed',
  name: 'Go to Dashboards',
  component: GoToDashboards,
  isHeadless: true,
});
