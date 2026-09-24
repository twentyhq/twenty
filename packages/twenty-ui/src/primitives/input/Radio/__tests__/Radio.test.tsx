import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';
import groupStyles from '@ui/primitives/input/RadioGroup/RadioGroup.module.scss';

import { Radio } from '../Radio';
import styles from '../Radio.module.scss';

const RadioGroupWrapper = ({ children }: { children: ReactNode }) => (
  <RadioGroup>{children}</RadioGroup>
);

runComponentConformance({
  name: 'Radio',
  element: <Radio value="option">Option</Radio>,
  wrapper: RadioGroupWrapper,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.root,
});

runComponentConformance({
  name: 'RadioGroup',
  element: <RadioGroup />,
  refInstanceOf: HTMLDivElement,
  ownClassName: groupStyles.root,
});
