import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';

import { CardPicker } from '../CardPicker';
import styles from '../CardPicker.module.scss';

const RadioGroupWrapper = ({ children }: { children: ReactNode }) => (
  <RadioGroup>{children}</RadioGroup>
);

runComponentConformance({
  name: 'CardPicker',
  element: <CardPicker value="option">Option</CardPicker>,
  wrapper: RadioGroupWrapper,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
  renderPropTagName: 'div',
});
