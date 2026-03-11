import { CommandLink, defineFrontComponent } from 'twenty-sdk';
import { AppPath } from 'twenty-shared/types';

const GoToTasks = () => <CommandLink to={AppPath.TasksPage} />;

export default defineFrontComponent({
  universalIdentifier: 'c08ff958-141d-4892-8737-1faf6b630a2b',
  name: 'Go to Tasks',
  component: GoToTasks,
  isHeadless: true,
});
