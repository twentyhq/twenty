import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ResizeHandle } from '../ResizeHandle';
import styles from '../ResizeHandle.module.scss';

runComponentConformance({
  name: 'ResizeHandle',
  element: <ResizeHandle />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.area,
});
