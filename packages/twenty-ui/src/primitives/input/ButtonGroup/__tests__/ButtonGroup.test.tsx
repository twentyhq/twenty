import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { ButtonGroup } from '../ButtonGroup';
import styles from '../ButtonGroup.module.scss';

runComponentConformance({
  name: 'ButtonGroup',
  element: <ButtonGroup aria-label="Actions" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});
