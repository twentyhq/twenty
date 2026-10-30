import { IconChevronDown, IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { InputGroup } from '@ui/primitives/input/InputGroup/InputGroup';
import { Text } from '@ui/primitives/typography/Text/Text';

import { Autocomplete } from '../Autocomplete';

type City = { id: number; name: string; country: string };
type CityGroup = { label: string; items: City[] };

const CITY_GROUPS: CityGroup[] = [
  {
    label: 'Western Europe',
    items: [
      { id: 1, name: 'Paris', country: 'France' },
      { id: 2, name: 'Lisbon', country: 'Portugal' },
    ],
  },
  {
    label: 'Central Europe',
    items: [{ id: 3, name: 'Berlin', country: 'Germany' }],
  },
];

export const AutocompleteGroupedExample = () => (
  <Text
    style={{ display: 'grid', alignContent: 'start', gap: 8, width: '100%' }}
  >
    <label htmlFor="grouped-city">
      <Text render={<span />}>City</Text>
    </label>
    <Autocomplete.Root
      items={CITY_GROUPS}
      itemToStringValue={(city) => city.name}
      autoHighlight="always"
    >
      <Autocomplete.InputGroup render={<InputGroup />}>
        <Autocomplete.Input id="grouped-city" placeholder="Search cities" />
        <Autocomplete.Clear
          aria-label="Clear city"
          render={<Button variant="ghost" size="sm" startIcon={<IconX />} />}
        />
        <Autocomplete.Trigger
          aria-label="Show cities"
          render={<Button variant="ghost" size="sm" />}
        >
          <Autocomplete.Icon>
            <IconChevronDown />
          </Autocomplete.Icon>
        </Autocomplete.Trigger>
      </Autocomplete.InputGroup>
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Arrow />
            <Autocomplete.Empty>No matching cities</Autocomplete.Empty>
            <Autocomplete.List>
              {(group: CityGroup, groupIndex: number) => (
                <Autocomplete.Group key={group.label} items={group.items}>
                  {groupIndex > 0 && <Autocomplete.Separator />}
                  <Autocomplete.GroupLabel>
                    {group.label}
                  </Autocomplete.GroupLabel>
                  <Autocomplete.Collection>
                    {(city: City) => (
                      <Autocomplete.Item
                        key={city.id}
                        value={city}
                        description={city.country}
                      >
                        {city.name}
                      </Autocomplete.Item>
                    )}
                  </Autocomplete.Collection>
                </Autocomplete.Group>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
      <Autocomplete.Status
        render={<Text />}
        style={{ color: 'var(--t-font-color-secondary)' }}
      >
        <Autocomplete.Value>
          {(value) =>
            value ? `City query: ${value}` : 'Type to search cities'
          }
        </Autocomplete.Value>
      </Autocomplete.Status>
    </Autocomplete.Root>
  </Text>
);
