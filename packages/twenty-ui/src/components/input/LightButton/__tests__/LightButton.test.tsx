import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { LightButton } from '../LightButton';
import styles from '../LightButton.module.scss';

runComponentConformance({
  name: 'LightButton',
  element: <LightButton>Add filter</LightButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});
