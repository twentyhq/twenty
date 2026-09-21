import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ListItem } from '../ListItem';
import styles from '../ListItem.module.scss';

runComponentConformance({
  name: 'ListItem',
  element: <ListItem>Item</ListItem>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});
