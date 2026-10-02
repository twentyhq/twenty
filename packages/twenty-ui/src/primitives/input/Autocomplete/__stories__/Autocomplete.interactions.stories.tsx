import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Autocomplete } from '../Autocomplete';
import { AutocompleteExample } from './AutocompleteExample';

const meta: Meta<typeof AutocompleteExample> = {
  title: 'UI/Input/Autocomplete/Interactions',
  component: AutocompleteExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280, height: 260 } },
};

export default meta;
type Story = StoryObj<typeof AutocompleteExample>;

export const KeyboardFocus: Story = {
  args: { filter: null, onValueChange: fn() },
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 'fruit');
    const body = within(canvasElement.ownerDocument.body);
    const apple = await body.findByRole('option', { name: 'Apple' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', apple.id),
    );
    await userEvent.keyboard('{ArrowDown}');
    const banana = body.getByRole('option', { name: 'Banana' });
    await expect(input).toHaveAttribute('aria-activedescendant', banana.id);
    await expect(input).toHaveFocus();
    await expect(input).toHaveValue('fruit');
    await userEvent.click(input);
    await expect(banana).toBeVisible();
    await userEvent.keyboard('{Enter}');
    await expect(input).toHaveValue('Banana');
    await expect(input).toHaveFocus();
    await userEvent.type(input, 'x');
    await body.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    await expect(input).toHaveFocus();
  },
};

export const EmptyResults: Story = {
  play: async ({ canvasElement }) => {
    const input = within(canvasElement).getByRole('combobox');
    await userEvent.type(input, 'Kiwi');
    const empty = await within(canvasElement.ownerDocument.body).findByText(
      'No fruits found',
    );
    await expect(empty).toBeVisible();
    await expect(input).toHaveFocus();
    await userEvent.clear(input);
    await userEvent.type(input, 'Cherry');
    await within(canvasElement.ownerDocument.body).findByRole('option', {
      name: 'Cherry',
    });
    await expect(
      within(canvasElement.ownerDocument.body).queryByText('No fruits found'),
    ).not.toBeInTheDocument();
  },
};

const ControlledResultsExample = () => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [items, setItems] = useState<string[]>([]);
  const [outsideClickCount, setOutsideClickCount] = useState(0);

  return (
    <>
      <Autocomplete.Root
        items={items}
        filter={null}
        autoHighlight="always"
        value={value}
        open={open}
        onValueChange={(nextValue, details) => {
          if (details.reason !== 'escape-key') {
            setValue(nextValue);
          }
        }}
        onOpenChange={(nextOpen, details) => {
          if (details.reason !== 'input-change') {
            setOpen(nextOpen);
          }
        }}
      >
        <Autocomplete.Input render={<input aria-label="Location" />} />
        <Autocomplete.Popup width={200} style={{ maxInlineSize: 180 }}>
          <Autocomplete.List>
            {(item: string) => (
              <Autocomplete.Item key={item} value={item}>
                {item}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
      <Button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => {
          setItems(['Paris, France', 'Paris, Texas']);
          setOpen(true);
        }}
      >
        Receive results
      </Button>
      <Button onClick={() => setOutsideClickCount((count) => count + 1)}>
        Outside
      </Button>
      <span>{`Outside clicks: ${outsideClickCount}`}</span>
    </>
  );
};

export const ControlledResults: Story = {
  render: () => <ControlledResultsExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Location' });
    const outsideButton = canvas.getByRole('button', { name: 'Outside' });
    await userEvent.type(input, 'Paris');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Receive results' }),
    );
    const option = await within(canvasElement.ownerDocument.body).findByRole(
      'option',
      { name: 'Paris, France' },
    );
    await expect(input).toHaveFocus();
    const listbox = within(canvasElement.ownerDocument.body).getByRole(
      'listbox',
    );
    await expect(listbox.getBoundingClientRect().width).toBeLessThan(180);
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', option.id),
    );
    await userEvent.keyboard('{Escape}');
    await expect(input).toHaveValue('Paris');
    await expect(input).toHaveFocus();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Receive results' }),
    );
    await within(canvasElement.ownerDocument.body).findByRole('listbox');
    await userEvent.click(outsideButton);
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-expanded', 'false'),
    );
    await expect(input).toHaveValue('Paris');
    await expect(canvas.getByText('Outside clicks: 0')).toBeVisible();
    await userEvent.click(outsideButton);
    await expect(canvas.getByText('Outside clicks: 1')).toBeVisible();
  },
};

const PreventedEnterExample = () => {
  const [enterCount, setEnterCount] = useState(0);

  return (
    <>
      <Autocomplete.Root items={['Apple', 'Banana']} autoHighlight="always">
        <Autocomplete.Input
          aria-label="Fruit"
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              setEnterCount((count) => count + 1);
            }
          }}
        />
        <Autocomplete.Popup>
          <Autocomplete.List>
            {(fruit: string) => (
              <Autocomplete.Item key={fruit} value={fruit}>
                {fruit}
              </Autocomplete.Item>
            )}
          </Autocomplete.List>
        </Autocomplete.Popup>
      </Autocomplete.Root>
      <span>{`Enter count: ${enterCount}`}</span>
    </>
  );
};

export const PreventedKeyDown: Story = {
  render: () => <PreventedEnterExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox', { name: 'Fruit' });
    await userEvent.type(input, 'a');
    const apple = await body.findByRole('option', { name: 'Apple' });
    await waitFor(() =>
      expect(input).toHaveAttribute('aria-activedescendant', apple.id),
    );
    await userEvent.keyboard('{Enter}');
    await expect(canvas.getByText('Enter count: 1')).toBeVisible();
    await expect(input).toHaveValue('a');
    await expect(input).toHaveAttribute('aria-expanded', 'true');
  },
};
