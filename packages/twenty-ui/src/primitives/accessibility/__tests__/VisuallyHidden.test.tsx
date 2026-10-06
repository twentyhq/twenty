import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { VisuallyHidden } from '../components/VisuallyHidden';
import styles from '../components/VisuallyHidden.module.scss';

runComponentConformance({
  name: 'VisuallyHidden',
  element: <VisuallyHidden>Supporting text</VisuallyHidden>,
  ownClassName: styles.root,
  refInstanceOf: HTMLSpanElement,
  renderPropTagName: 'div',
});
