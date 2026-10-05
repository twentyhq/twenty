import { type ReactNode } from 'react';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';

import { Autocomplete } from '../Autocomplete';
import styles from '../Autocomplete.module.scss';

const RootWrapper = ({ children }: { children: ReactNode }) => (
  <Autocomplete.Root>{children}</Autocomplete.Root>
);
const OpenWrapper = ({ children }: { children: ReactNode }) => (
  <Autocomplete.Root open items={[]}>
    <Autocomplete.Input aria-label="Search" />
    {children}
  </Autocomplete.Root>
);
const PopupWrapper = ({ children }: { children: ReactNode }) => (
  <OpenWrapper>
    <Autocomplete.Popup>{children}</Autocomplete.Popup>
  </OpenWrapper>
);
const ListWrapper = ({ children }: { children: ReactNode }) => (
  <PopupWrapper>
    <Autocomplete.List>{children}</Autocomplete.List>
  </PopupWrapper>
);

runComponentConformance({
  name: 'Autocomplete.InputGroup',
  element: <Autocomplete.InputGroup />,
  refInstanceOf: HTMLDivElement,
  wrapper: RootWrapper,
  ownClassName: styles.inputGroup,
});
runComponentConformance({
  name: 'Autocomplete.Input',
  element: <Autocomplete.Input aria-label="Search" />,
  refInstanceOf: HTMLInputElement,
  wrapper: RootWrapper,
  ownClassName: inputStyles.input,
  renderPropTagName: 'input',
});
runComponentConformance({
  name: 'Autocomplete.Popup',
  element: <Autocomplete.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Autocomplete.List',
  element: <Autocomplete.List />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.list,
});
runComponentConformance({
  name: 'Autocomplete.Item',
  element: <Autocomplete.Item value="first">First</Autocomplete.Item>,
  refInstanceOf: HTMLDivElement,
  wrapper: ListWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Autocomplete.Empty',
  element: <Autocomplete.Empty>No results</Autocomplete.Empty>,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.empty,
});
