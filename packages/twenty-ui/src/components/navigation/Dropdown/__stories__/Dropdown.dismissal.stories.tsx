import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { type DropdownDismissEvent } from '../types/DropdownDismissEvent';
import { type DropdownRootProps } from '../types/DropdownRootProps';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

type DismissibleRecordActionsProps = Pick<
  DropdownRootProps,
  'onEscapeKeyDown' | 'onInteractOutside'
> & {
  onOutsideClick: () => void;
};

const DismissibleRecordActions = ({
  onEscapeKeyDown,
  onInteractOutside,
  onOutsideClick,
}: DismissibleRecordActionsProps) => (
  <>
    <Dropdown.Root
      type="menu"
      onEscapeKeyDown={onEscapeKeyDown}
      onInteractOutside={onInteractOutside}
    >
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </Dropdown.Content>
    </Dropdown.Root>
    <Button onClick={onOutsideClick}>Outside</Button>
  </>
);

const preventDismiss = (event: DropdownDismissEvent) => {
  event.preventDefault();
};

const openRecordActions = async (canvasElement: HTMLElement) => {
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Record actions',
  });

  await userEvent.click(trigger);
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('menu', {
        name: 'Record actions',
      }),
    ).toBeVisible(),
  );

  return trigger;
};

const meta: Meta<typeof DismissibleRecordActions> = {
  title: 'UI/Components/Dropdown/Interactions/Dismissal',
  component: DismissibleRecordActions,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  args: {
    onEscapeKeyDown: fn(),
    onInteractOutside: fn(),
    onOutsideClick: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof DismissibleRecordActions>;

export const EscapeKeyDown: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await openRecordActions(canvasElement);

    await userEvent.keyboard('{Escape}');

    expect(args.onEscapeKeyDown).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const EscapeKeyDownPrevented: Story = {
  args: { onEscapeKeyDown: fn(preventDismiss) },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await openRecordActions(canvasElement);

    await userEvent.keyboard('{Escape}');

    expect(args.onEscapeKeyDown).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();
  },
};

export const InteractOutside: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const outside = within(canvasElement).getByRole('button', {
      name: 'Outside',
    });

    await openRecordActions(canvasElement);
    await userEvent.click(outside);

    expect(args.onInteractOutside).toHaveBeenCalledOnce();
    expect(args.onInteractOutside).toHaveBeenCalledWith(
      expect.objectContaining({ target: outside }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(args.onOutsideClick).not.toHaveBeenCalled();
  },
};

export const InteractOutsidePrevented: Story = {
  args: { onInteractOutside: fn(preventDismiss) },
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await openRecordActions(canvasElement);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Outside' }),
    );

    expect(args.onOutsideClick).toHaveBeenCalledOnce();
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();

    await userEvent.keyboard('{Escape}');

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const TabAway: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.tab();

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(args.onInteractOutside).toHaveBeenCalledOnce();
    expect(args.onInteractOutside).toHaveBeenCalledWith(
      expect.objectContaining({ target: null }),
    );
  },
};
