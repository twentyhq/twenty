import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { MainButton } from '../MainButton';
import styles from '../MainButton.module.scss';

runComponentConformance({
  name: 'MainButton',
  element: <MainButton>Save changes</MainButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});
