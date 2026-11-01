import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Callout } from '../Callout';
import styles from '../internal/CalloutAction.module.scss';

runComponentConformance({
  name: 'Callout.Action',
  element: <Callout.Action>Retry sync</Callout.Action>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.action,
});
