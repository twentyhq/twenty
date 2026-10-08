import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { TabButton } from '../TabButton';
import styles from '../TabButton.module.scss';

runComponentConformance({
  name: 'TabButton',
  element: <TabButton>Overview</TabButton>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});

runComponentConformance({
  name: 'TabButton link',
  element: <TabButton href="#overview">Overview</TabButton>,
  refInstanceOf: HTMLAnchorElement,
  ownClassName: styles.button,
  renderPropTagName: 'a',
});
