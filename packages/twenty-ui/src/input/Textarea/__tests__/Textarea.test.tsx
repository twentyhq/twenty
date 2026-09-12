import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Textarea } from '../Textarea';
import styles from '../Textarea.module.scss';

runComponentConformance({
  name: 'Textarea',
  element: <Textarea />,
  refInstanceOf: HTMLTextAreaElement,
  ownClassName: styles.textarea,
  renderPropTagName: 'textarea',
});
