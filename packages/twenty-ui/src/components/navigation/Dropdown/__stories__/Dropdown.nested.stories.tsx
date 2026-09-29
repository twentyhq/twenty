import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onSelectDirection = fn();

const NestedPicker = () => (
  <>
    <button type="button">Outside</button>
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Sort</Dropdown.Trigger>
      <Dropdown.Content aria-label="Sort fields">
        <Dropdown.Root type="picker">
          <Dropdown.Trigger>Direction</Dropdown.Trigger>
          <Dropdown.Content aria-label="Sort direction">
            <Dropdown.OptionItem selected={false} onSelect={onSelectDirection}>
              Descending
            </Dropdown.OptionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Dropdown.Search aria-label="Search fields" />
        <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  </>
);

const openSortDirection = async (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Sort' }),
  );
  await waitFor(() =>
    expect(body.getByRole('dialog', { name: 'Sort fields' })).toBeVisible(),
  );
  await userEvent.click(body.getByRole('button', { name: 'Direction' }));
  await waitFor(() =>
    expect(body.getByRole('dialog', { name: 'Sort direction' })).toBeVisible(),
  );
};

const playDismissesOneLayerAtATime =
  (dismissal: 'escape' | 'outside press') =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const dismiss = () => {
      if (dismissal === 'escape') {
        return userEvent.keyboard('{Escape}');
      }

      return userEvent.click(
        within(canvasElement).getByRole('button', { name: 'Outside' }),
      );
    };

    await openSortDirection(canvasElement);
    await dismiss();
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Sort direction' }),
      ).not.toBeInTheDocument(),
    );
    expect(body.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();

    if (dismissal === 'escape') {
      await waitFor(() =>
        expect(body.getByRole('button', { name: 'Direction' })).toHaveFocus(),
      );
    }

    await userEvent.click(body.getByRole('button', { name: 'Direction' }));
    await body.findByRole('dialog', { name: 'Sort direction' });
    await dismiss();
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Sort direction' }),
      ).not.toBeInTheDocument(),
    );
    expect(body.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();
    await dismiss();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  };

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Nested',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    onSelectDirection.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const InnerSelectionKeepsParentOpen: Story = {
  render: () => <NestedPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openSortDirection(canvasElement);
    await userEvent.click(body.getByRole('button', { name: 'Descending' }));

    expect(onSelectDirection).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Sort direction' }),
      ).not.toBeInTheDocument(),
    );
    expect(body.getByRole('dialog', { name: 'Sort fields' })).toBeVisible();
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Direction' })).toHaveFocus(),
    );
  },
};

export const DismissesOneLayerWithEscape: Story = {
  render: () => <NestedPicker />,
  play: playDismissesOneLayerAtATime('escape'),
};

export const DismissesOneLayerWithOutsidePress: Story = {
  render: () => <NestedPicker />,
  play: playDismissesOneLayerAtATime('outside press'),
};
