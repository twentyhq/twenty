import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { type DropdownOpenChangeDetails } from '../types/DropdownOpenChangeDetails';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const onOpenChange = fn();
const onSubmenuOpenChange = fn();
const onOutsideClick = fn();

const cancelEveryCloseButEscape = (
  open: boolean,
  eventDetails: DropdownOpenChangeDetails,
) => {
  if (!open && eventDetails.reason !== 'escape-key') {
    eventDetails.cancel();
  }
};

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Open Changes',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    for (const spy of [onOpenChange, onSubmenuOpenChange, onOutsideClick]) {
      spy.mockClear();
    }
  },
};

export default meta;
type Story = StoryObj;

export const Reasons: Story = {
  render: () => (
    <>
      <Dropdown.Root type="menu" onOpenChange={onOpenChange}>
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
      <Button>Outside</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Record actions' });

    await userEvent.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    );

    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Duplicate' }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'item-press',
        event: expect.objectContaining({ type: 'click' }),
      }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );

    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );

    await userEvent.click(trigger);
    await body.findByRole('menu');
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: expect.stringMatching(/^(focus-out|outside-press)$/),
      }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const SubmenuReasons: Story = {
  render: () => (
    <Dropdown.Root type="menu" onOpenChange={onOpenChange}>
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Submenu onOpenChange={onSubmenuOpenChange}>
          <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
          <Dropdown.Content>
            <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const exportTrigger = await body.findByRole('menuitem', {
      name: 'Export',
    });

    await waitFor(() => expect(exportTrigger).toHaveFocus());
    await userEvent.keyboard('{ArrowRight}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );

    await userEvent.keyboard('{ArrowLeft}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() => expect(exportTrigger).toHaveFocus());

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    await waitFor(() => expect(exportTrigger).toHaveFocus());
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();

    await userEvent.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const CanceledChanges: Story = {
  render: () => (
    <>
      <Dropdown.Root type="menu" onOpenChange={cancelEveryCloseButEscape}>
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>
      <Button onClick={onOutsideClick}>Outside</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Record actions' }),
    );
    const menu = await body.findByRole('menu');

    await userEvent.click(body.getByRole('menuitem', { name: 'Duplicate' }));
    expect(menu).toBeVisible();

    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    expect(onOutsideClick).toHaveBeenCalledOnce();
    expect(menu).toBeVisible();

    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};
