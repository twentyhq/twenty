import { type ReactElement, type ReactNode } from 'react';
import { expectTypeOf, it } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import listItemStyles from '@ui/primitives/navigation/ListItem/ListItem.module.scss';

import { Autocomplete } from '@ui/primitives/input';
import styles from '../Autocomplete.module.scss';
import { type AutocompleteInputProps } from '../types/AutocompleteInputProps';

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
    <Autocomplete.Portal>
      <Autocomplete.Positioner>
        <Autocomplete.Popup>{children}</Autocomplete.Popup>
      </Autocomplete.Positioner>
    </Autocomplete.Portal>
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
  renderPropKeepsOwnClassName: false,
  renderPropTagName: 'input',
});
runComponentConformance({
  name: 'Autocomplete.Popup',
  element: <Autocomplete.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <OpenWrapper>
      <Autocomplete.Portal>
        <Autocomplete.Positioner>{children}</Autocomplete.Positioner>
      </Autocomplete.Portal>
    </OpenWrapper>
  ),
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

runComponentConformance({
  name: 'Autocomplete.Arrow',
  element: <Autocomplete.Arrow />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.arrow,
});

runComponentConformance({
  name: 'Autocomplete.Separator',
  element: <Autocomplete.Separator />,
  refInstanceOf: HTMLDivElement,
  wrapper: PopupWrapper,
  ownClassName: styles.separator,
});

runComponentConformance({
  name: 'Autocomplete.Portal',
  element: <Autocomplete.Portal />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenWrapper,
});

runComponentConformance({
  name: 'Autocomplete.Positioner',
  element: <Autocomplete.Positioner />,
  refInstanceOf: HTMLDivElement,
  wrapper: ({ children }) => (
    <OpenWrapper>
      <Autocomplete.Portal>{children}</Autocomplete.Portal>
    </OpenWrapper>
  ),
  ownClassName: styles.positioner,
});

runComponentConformance({
  name: 'Autocomplete.Trigger',
  element: <Autocomplete.Trigger>Show options</Autocomplete.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: RootWrapper,
  renderPropTagName: 'button',
});

runComponentConformance({
  name: 'Autocomplete.Clear',
  element: <Autocomplete.Clear keepMounted>Clear</Autocomplete.Clear>,
  refInstanceOf: HTMLButtonElement,
  wrapper: RootWrapper,
  renderPropTagName: 'button',
});

it('accepts size only on an Autocomplete.Input without render', () => {
  expectTypeOf<{ size: 'sm' }>().toExtend<AutocompleteInputProps>();
  expectTypeOf<{ render: ReactElement }>().toExtend<AutocompleteInputProps>();
  expectTypeOf<{
    render: ReactElement;
    size: 'sm';
  }>().not.toExtend<AutocompleteInputProps>();
});
