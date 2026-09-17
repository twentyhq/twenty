import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconSearch } from '@ui/icon';
import { IconButton } from '@ui/components/IconButton/IconButton';

import { IconButtonGroup } from '../IconButtonGroup';
import styles from '../IconButtonGroup.module.scss';

runComponentConformance({
  name: 'IconButtonGroup',
  element: (
    <IconButtonGroup aria-label="Actions">
      <IconButton aria-label="Search">
        <IconSearch />
      </IconButton>
    </IconButtonGroup>
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});
