import { useRef, useState } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';

import { Autocomplete } from '../Autocomplete';

const FRUITS = ['Apple', 'Banana', 'Cherry'];

export const AutocompletePositionedExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <>
      <Autocomplete.Root items={FRUITS} defaultOpen autoHighlight="always">
        <Autocomplete.Input
          aria-label="Fruit"
          ref={inputRef}
          render={<Input data-composed-input="true" />}
        />
        <Autocomplete.Portal
          container={container}
          keepMounted
          data-testid="suggestion-portal"
        >
          <Autocomplete.Backdrop data-testid="suggestion-backdrop" />
          <Autocomplete.Positioner
            anchor={inputRef}
            side="bottom"
            align="end"
            sideOffset={({ anchor }) => anchor.height / 2}
            positionMethod="fixed"
            collisionAvoidance={{ side: 'none', align: 'none' }}
            data-testid="suggestion-positioner"
          >
            <Autocomplete.Popup
              width={180}
              render={<section data-testid="suggestion-popup" />}
            >
              <Autocomplete.List>
                {(fruit: string) => (
                  <Autocomplete.Item key={fruit} value={fruit}>
                    {fruit}
                  </Autocomplete.Item>
                )}
              </Autocomplete.List>
            </Autocomplete.Popup>
          </Autocomplete.Positioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      <div
        ref={setContainer}
        role="region"
        aria-label="Suggestion destination"
      />
    </>
  );
};
