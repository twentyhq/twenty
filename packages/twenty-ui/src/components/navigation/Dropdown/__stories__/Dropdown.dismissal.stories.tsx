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
}: DismissibleRecordActionsProps) => {
  return (
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
};

const RecordDetailsPanel = ({
  onInteractOutside,
  onOutsideClick,
}: DismissibleRecordActionsProps) => {
  return (
    <>
      <Button>Before</Button>
      <Dropdown.Root type="panel" onInteractOutside={onInteractOutside}>
        <Dropdown.Trigger>Record details</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record details" initialFocus={false}>
          Last updated today
        </Dropdown.Content>
      </Dropdown.Root>
      <Button onClick={onOutsideClick}>Outside</Button>
    </>
  );
};

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

const swipeFromElement = (element: Element) => {
  const bounds = element.getBoundingClientRect();
  const startX = bounds.left + bounds.width / 2;
  const startY = bounds.top + bounds.height / 2;
  const dispatchTouch = (
    type: 'touchstart' | 'touchmove' | 'touchend',
    clientX: number,
  ) => {
    const touch = new Touch({
      identifier: 1,
      target: element,
      clientX,
      clientY: startY,
    });
    const activeTouches = type === 'touchend' ? [] : [touch];

    element.dispatchEvent(
      new TouchEvent(type, {
        bubbles: true,
        cancelable: true,
        composed: true,
        touches: activeTouches,
        targetTouches: activeTouches,
        changedTouches: [touch],
      }),
    );
  };

  dispatchTouch('touchstart', startX);
  dispatchTouch('touchmove', startX + 40);
  dispatchTouch('touchend', startX + 40);
};

const meta: Meta<typeof DismissibleRecordActions> = {
  id: 'ui-components-dropdown-interactions-dismissal',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Dismissal',
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
    const handleDocumentClick = fn();
    canvasElement.ownerDocument.addEventListener(
      'click',
      handleDocumentClick,
      true,
    );

    try {
      await userEvent.click(outside);

      expect(args.onInteractOutside).toHaveBeenCalledOnce();
      expect(args.onInteractOutside).toHaveBeenCalledWith(
        expect.objectContaining({ target: outside }),
      );
      await waitFor(() =>
        expect(body.queryByRole('menu')).not.toBeInTheDocument(),
      );
      expect(args.onOutsideClick).not.toHaveBeenCalled();
      expect(handleDocumentClick).not.toHaveBeenCalled();

      await userEvent.click(outside);

      expect(args.onOutsideClick).toHaveBeenCalledOnce();
      expect(handleDocumentClick).toHaveBeenCalledOnce();
    } finally {
      canvasElement.ownerDocument.removeEventListener(
        'click',
        handleDocumentClick,
        true,
      );
    }
  },
};

export const SwipeOutside: Story = {
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const outside = within(canvasElement).getByRole('button', {
      name: 'Outside',
    });

    await openRecordActions(canvasElement);
    swipeFromElement(outside);

    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(args.onInteractOutside).toHaveBeenCalledWith(
      expect.objectContaining({ target: outside, type: 'touchmove' }),
    );
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

export const ShiftTabAwayKeepsNextClick: Story = {
  render: (args) => <RecordDetailsPanel {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Record details' });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(
        body.getByRole('dialog', { name: 'Record details' }),
      ).toBeVisible(),
    );
    expect(trigger).toHaveFocus();

    await userEvent.tab({ shift: true });

    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(args.onInteractOutside).toHaveBeenCalled();

    canvas.getByRole('button', { name: 'Outside' }).click();

    expect(args.onOutsideClick).toHaveBeenCalledOnce();
  },
};
