import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToNotes = () => (
  <CommandLink
    to={AppPath.RecordIndexPage}
    params={{ objectNamePlural: 'notes' }}
  />
);

export default defineFrontComponent({
  universalIdentifier: 'd32f7962-e8e1-46d6-856c-ccc71e71d50c',
  name: 'Go to Notes',
  component: GoToNotes,
  isHeadless: true,
});
