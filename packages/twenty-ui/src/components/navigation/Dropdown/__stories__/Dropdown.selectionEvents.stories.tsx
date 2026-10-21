import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { type DropdownSelectionGroupChangeEventDetails } from '../types/DropdownSelectionGroupChangeEventDetails';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onOptionSelect = fn();
const onOwnerChange = fn();
let searchEnter: KeyboardEvent | undefined;
let optionEventDetails: DropdownSelectionGroupChangeEventDetails | undefined;
let ownerEventDetails: DropdownSelectionGroupChangeEventDetails | undefined;
const POPUP_OPEN_TIMEOUT = 5000;

const meta: Meta = {
  id: 'ui-components-dropdown-interactions-selection-events',
  title: 'UI/Components/Navigation/Dropdown/Interactions/SelectionEvents',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    onOptionSelect.mockClear();
    onOwnerChange.mockClear();
    searchEnter = undefined;
    optionEventDetails = undefined;
    ownerEventDetails = undefined;
  },
};

export default meta;
type Story = StoryObj;

export const SearchEnterPreservesEvent: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Choose people</Dropdown.Trigger>
      <Dropdown.Content aria-label="People">
        <Dropdown.Search
          aria-label="Search people"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              searchEnter = event.nativeEvent;
            }
          }}
        />
        <Dropdown.SelectionGroup
          id="owner"
          aria-label="Owner"
          closeOnSelect={false}
          onValueChange={(value, eventDetails) => {
            ownerEventDetails = eventDetails;
            onOwnerChange(value);
          }}
        >
          <Dropdown.OptionItem
            value="ada"
            onSelect={(eventDetails) => {
              optionEventDetails = eventDetails;
              onOptionSelect();
            }}
          >
            Ada Lovelace
          </Dropdown.OptionItem>
          <Dropdown.OptionItem
            value="grace"
            onSelect={(eventDetails) => {
              optionEventDetails = eventDetails;
              onOptionSelect();
            }}
          >
            Grace Hopper
          </Dropdown.OptionItem>
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose people' }),
    );

    const picker = await body.findByRole('dialog', { name: 'People' });
    await waitFor(() => expect(picker).toBeVisible(), {
      timeout: POPUP_OPEN_TIMEOUT,
    });
    const search = within(picker).getByRole('searchbox', {
      name: 'Search people',
    });
    const ada = within(picker).getByRole('option', { name: 'Ada Lovelace' });
    const grace = within(picker).getByRole('option', { name: 'Grace Hopper' });

    await userEvent.type(search, 'Ada');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(searchEnter).toBeInstanceOf(KeyboardEvent);
    expect(onOptionSelect).toHaveBeenCalledOnce();
    expect(optionEventDetails?.event).toBe(searchEnter);
    expect(optionEventDetails?.trigger).toBe(ada);
    expect(onOwnerChange).toHaveBeenCalledOnce();
    expect(onOwnerChange).toHaveBeenLastCalledWith('ada');
    expect(ownerEventDetails).toBe(optionEventDetails);
    expect(searchEnter?.key).toBe('Enter');
    expect(searchEnter?.shiftKey).toBe(true);
    expect(searchEnter?.target).toBe(search);
    expect(ada).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(grace);
    expect(onOwnerChange).toHaveBeenLastCalledWith('grace');
    expect(ownerEventDetails?.event.type).toBe('click');
    expect(ownerEventDetails?.event.target).toBe(grace);
    expect(ownerEventDetails?.trigger).toBe(grace);
    expect(grace).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Escape}');
  },
};
