import { type Ref } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { themeCssVariables } from '@ui/theme';

import { Dropdown } from '../Dropdown';
import { useDropdownPlacementOrThrow } from '../hooks/useDropdownPlacementOrThrow';

type DropdownPlacementExampleProps = {
  onContentRef: Ref<HTMLDivElement>;
};

const ResolvedDropdownPlacement = () => {
  const { side, align } = useDropdownPlacementOrThrow();

  return (
    <Text
      data-testid="resolved-placement"
      data-resolved-side={side}
      data-resolved-align={align}
    >
      {side} / {align}
    </Text>
  );
};

export const DropdownPlacementExample = ({
  onContentRef,
}: DropdownPlacementExampleProps) => (
  <div
    style={{
      position: 'fixed',
      bottom: themeCssVariables.spacing[2],
      left: themeCssVariables.spacing[10],
    }}
  >
    <Dropdown.Root type="picker">
      <Dropdown.Trigger render={<Button>Placement picker</Button>} />
      <Dropdown.Content
        side="bottom"
        align="start"
        sideOffset={8}
        width={240}
        ref={onContentRef}
        render={<div data-caller-render="preserved" />}
      >
        <ResolvedDropdownPlacement />
        <Dropdown.Section>
          <Dropdown.SelectionGroup id="placement-options" aria-label="People">
            <Dropdown.OptionItem value="ada">Ada Lovelace</Dropdown.OptionItem>
            <Dropdown.OptionItem value="grace">
              Grace Hopper
            </Dropdown.OptionItem>
            <Dropdown.OptionItem value="margaret">
              Margaret Hamilton
            </Dropdown.OptionItem>
          </Dropdown.SelectionGroup>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  </div>
);
