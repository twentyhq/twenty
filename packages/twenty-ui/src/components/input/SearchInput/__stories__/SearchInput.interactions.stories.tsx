import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useRef, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { Input } from '@ui/primitives/input/Input/Input';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { SearchInput } from '../SearchInput';
import { SearchInputExample } from './SearchInputExample';

const onChange = fn();
const onFocus = fn();
const onBlur = fn();
const onParentKeyDown = fn();
const onParentClick = fn();
const onTriggerClick = fn();
const onSubmit = fn();

const NativeInputExample = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onKeyDown={onParentKeyDown}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit(new FormData(event.currentTarget).get('search'));
      }}
    >
      <Text id="people-search-label">Find people</Text>
      <SearchInputExample
        ref={inputRef}
        id="people-search"
        name="search"
        aria-labelledby="people-search-label"
        aria-label="Fallback search"
        placeholder="Name or email"
        autoComplete="off"
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={(event) => event.stopPropagation()}
      />
      <Button onClick={() => inputRef.current?.focus()}>Focus search</Button>
      <Button type="submit">Search people</Button>
    </form>
  );
};

type FilterPanelExampleProps = {
  filterDisabled?: boolean;
  searchDisabled?: boolean;
};

const FilterPanelExample = ({
  filterDisabled = false,
  searchDisabled = false,
}: FilterPanelExampleProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <form
      onClick={onParentClick}
      onKeyDown={onParentKeyDown}
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
    >
      <SearchInput
        placeholder="Search people"
        value={search}
        onValueChange={setSearch}
        disabled={searchDisabled}
        filterButtonAriaLabel="Filter people"
        filterDropdown={(filterButton) => (
          <Dropdown.Root type="panel" open={open} onOpenChange={setOpen}>
            <Dropdown.Trigger
              render={filterButton}
              ref={triggerRef}
              onClick={onTriggerClick}
              disabled={filterDisabled}
            />
            <Dropdown.Content>
              <Dropdown.Section>
                <Field.Root>
                  <Field.Label style={{ color: 'var(--t-font-color-primary)' }}>
                    Company
                  </Field.Label>
                  <Input />
                </Field.Root>
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>
        )}
      />
      <Button onClick={() => triggerRef.current?.focus()}>Focus filters</Button>
    </form>
  );
};

const meta: Meta = {
  title: 'UI/Input/SearchInput/Interactions',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  beforeEach: () => {
    onChange.mockClear();
    onFocus.mockClear();
    onBlur.mockClear();
    onParentKeyDown.mockClear();
    onParentClick.mockClear();
    onTriggerClick.mockClear();
    onSubmit.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const NativeInput: Story = {
  render: () => <NativeInputExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Find people' });

    await userEvent.click(canvas.getByRole('button', { name: 'Focus search' }));
    expect(input).toHaveFocus();
    expect(onFocus).toHaveBeenCalledOnce();
    expect(input).toHaveAttribute('id', 'people-search');
    expect(input).toHaveAttribute('autocomplete', 'off');

    await userEvent.type(input, 'Ada');
    expect(input).toHaveValue('Ada');
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ target: input, type: 'change' }),
    );
    expect(onParentKeyDown).not.toHaveBeenCalled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Search people' }),
    );
    expect(onSubmit).toHaveBeenCalledWith('Ada');
    expect(onBlur).toHaveBeenCalledOnce();
  },
};

export const FilterPanel: Story = {
  render: () => <FilterPanelExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('textbox', { name: 'Search people' });
    const trigger = canvas.getByRole('button', { name: 'Filter people' });

    await userEvent.type(input, 'Ada');
    expect(input).toHaveValue('Ada');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus filters' }),
    );
    expect(trigger).toHaveFocus();
    onParentClick.mockClear();

    await userEvent.keyboard('{Enter}');
    expect(onTriggerClick).toHaveBeenCalledOnce();
    expect(onParentClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Filter people' })).toBeVisible(),
    );
    const companyInput = body.getByRole('textbox', { name: 'Company' });
    await waitFor(() => expect(companyInput).toHaveFocus());
    await userEvent.type(companyInput, 'Acme');
    expect(companyInput).toHaveValue('Acme');

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(input).toHaveValue('Ada');
    await userEvent.type(input, ' Lovelace');
    expect(input).toHaveValue('Ada Lovelace');
  },
};

export const DisabledSearch: Story = {
  render: () => <FilterPanelExample searchDisabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      canvas.getByRole('textbox', { name: 'Search people' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Filter people' }),
    );
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Filter people' })).toBeVisible(),
    );
  },
};

export const DisabledFilter: Story = {
  render: () => <FilterPanelExample filterDisabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Filter people' });

    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onTriggerClick).not.toHaveBeenCalled();
    expect(onSubmit).not.toHaveBeenCalled();
  },
};
