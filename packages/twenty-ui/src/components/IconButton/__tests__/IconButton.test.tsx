import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconSearch } from '@ui/icon';

import { IconButton } from '../IconButton';
import styles from '../IconButton.module.scss';

runComponentConformance({
  name: 'IconButton',
  element: (
    <IconButton aria-label="Search">
      <IconSearch />
    </IconButton>
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});
