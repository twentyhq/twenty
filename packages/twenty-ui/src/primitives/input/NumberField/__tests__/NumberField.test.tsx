import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';

import { NumberField } from '../NumberField';
import styles from '../NumberField.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <NumberField.Root defaultValue={1}>{children}</NumberField.Root>
);

runComponentConformance({
  name: 'NumberField.Root',
  element: <NumberField.Root />,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'NumberField.Group',
  element: <NumberField.Group />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.group,
  renderPropTagName: 'div',
});

runComponentConformance({
  name: 'NumberField.Input',
  element: <NumberField.Input aria-label="Quantity" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLInputElement,
  ownClassName: inputStyles.input,
  renderPropTagName: 'input',
});

runComponentConformance({
  name: 'NumberField.Increment',
  element: <NumberField.Increment aria-label="Increase value" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'NumberField.Decrement',
  element: <NumberField.Decrement aria-label="Decrease value" />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'NumberField.ScrubArea',
  element: <NumberField.ScrubArea />,
  wrapper: RootWrapper,
  refInstanceOf: HTMLSpanElement,
});
