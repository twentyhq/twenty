import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToCompanies = () => (
  <CommandLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'companies' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: '22ac113b-fe7d-41de-b06f-d863964bc445',
  name: 'Go to Companies',
  component: GoToCompanies,
  isHeadless: true,
});
