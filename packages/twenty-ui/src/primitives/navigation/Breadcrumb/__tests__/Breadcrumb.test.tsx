import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Breadcrumb } from '../Breadcrumb';
import styles from '../Breadcrumb.module.scss';

runComponentConformance({
  name: 'Breadcrumb',
  element: <Breadcrumb links={[{ children: 'Workspace' }]} />,
  ownClassName: styles.root,
  refInstanceOf: HTMLElement,
});
