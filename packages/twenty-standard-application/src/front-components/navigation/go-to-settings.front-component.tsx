import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToSettings = () => <CommandLink to={AppPath.SettingsCatchAll} />;

export default defineFrontComponent({
  universalIdentifier: '1fb7b785-b79a-42b7-aff2-e57fe1d74e35',
  name: 'Go to Settings',
  component: GoToSettings,
  isHeadless: true,
});
