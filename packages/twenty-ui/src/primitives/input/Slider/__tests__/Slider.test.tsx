import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Slider } from '../Slider';
import styles from '../Slider.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <Slider.Root defaultValue={40}>{children}</Slider.Root>
);

const ControlWrapper = ({ children }: { children: ReactNode }) => (
  <RootWrapper>
    <Slider.Control>{children}</Slider.Control>
  </RootWrapper>
);

runComponentConformance({
  name: 'Slider.Root',
  element: <Slider.Root defaultValue={40} />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});

runComponentConformance({
  name: 'Slider.Control',
  element: <Slider.Control />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.control,
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Slider.Track',
  element: <Slider.Track />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.track,
  wrapper: ControlWrapper,
});

runComponentConformance({
  name: 'Slider.Indicator',
  element: <Slider.Indicator />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.indicator,
  wrapper: ControlWrapper,
});

runComponentConformance({
  name: 'Slider.Thumb',
  element: <Slider.Thumb aria-label="Volume" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.thumb,
  wrapper: ControlWrapper,
  // Base UI forwards the accessible name to the nested range input.
  skip: ['ariaAttributes'],
});

runComponentConformance({
  name: 'Slider.Label',
  element: <Slider.Label>Volume</Slider.Label>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.label,
  wrapper: RootWrapper,
});

runComponentConformance({
  name: 'Slider.Value',
  element: <Slider.Value />,
  refInstanceOf: HTMLOutputElement,
  ownClassName: styles.value,
  wrapper: RootWrapper,
});
