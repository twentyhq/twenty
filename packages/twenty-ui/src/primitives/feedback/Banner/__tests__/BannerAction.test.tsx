import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Banner } from '../Banner';
import styles from '../internal/BannerAction.module.scss';

runComponentConformance({
  name: 'Banner.Action',
  element: <Banner.Action>Retry sync</Banner.Action>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.action,
});
