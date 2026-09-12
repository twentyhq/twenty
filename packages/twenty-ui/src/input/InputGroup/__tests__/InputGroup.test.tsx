import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Input } from '@ui/input/Input/Input';

import { InputGroup } from '../InputGroup';
import styles from '../InputGroup.module.scss';

runComponentConformance({
  name: 'InputGroup',
  element: (
    <InputGroup>
      <Input aria-label="Grouped" />
    </InputGroup>
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});
