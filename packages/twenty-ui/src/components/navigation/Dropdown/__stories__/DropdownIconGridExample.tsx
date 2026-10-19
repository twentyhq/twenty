import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconCalendar } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

export const DropdownIconGridExample = ({
  onSelect,
}: {
  onSelect?: (index: number) => void;
}) => (
  <Dropdown.Root type="picker">
    <Dropdown.Trigger render={<Button>Choose icon</Button>} />
    <Dropdown.Content width={200}>
      <Dropdown.Search aria-label="Search icons" />
      <Dropdown.SelectionGroup
        id="icons"
        aria-label="Icon choices"
        defaultValue="calendar-1"
      >
        <Dropdown.Section columns={3} label="Icons">
          {Array.from({ length: 8 }, (_, index) => (
            <Dropdown.OptionItem
              key={index}
              value={`calendar-${index + 1}`}
              disabled={index === 4}
              indicator="none"
              nativeButton
              aria-label={`Calendar ${index + 1}`}
              render={(props, state) => (
                <LightIconButton
                  // oxlint-disable-next-line react/jsx-props-no-spreading
                  {...props}
                  size="md"
                  color={state.selected ? 'accent' : 'neutral'}
                  aria-label={`Calendar ${index + 1}`}
                >
                  <IconCalendar />
                </LightIconButton>
              )}
              onSelect={() => onSelect?.(index)}
            />
          ))}
        </Dropdown.Section>
      </Dropdown.SelectionGroup>
    </Dropdown.Content>
  </Dropdown.Root>
);
