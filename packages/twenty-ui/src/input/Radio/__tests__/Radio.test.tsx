import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { CardPicker } from '@ui/input/CardPicker/CardPicker';
import cardPickerStyles from '@ui/input/CardPicker/CardPicker.module.scss';
import { RadioGroup } from '@ui/input/RadioGroup/RadioGroup';
import groupStyles from '@ui/input/RadioGroup/RadioGroup.module.scss';

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

runComponentConformance({
  name: 'CardPicker',
  element: <CardPicker value="option">Option</CardPicker>,
  wrapper: RadioGroupWrapper,
  refInstanceOf: HTMLDivElement,
  ownClassName: cardPickerStyles.container,
  renderPropTagName: 'div',
});
