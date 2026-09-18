import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { IconSearch } from '@ui/icon';

import { LightIconButton } from '../LightIconButton';
import styles from '../LightIconButton.module.scss';

runComponentConformance({
  name: 'LightIconButton',
  element: (
    <LightIconButton aria-label="Search">
      <IconSearch />
    </LightIconButton>
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});
