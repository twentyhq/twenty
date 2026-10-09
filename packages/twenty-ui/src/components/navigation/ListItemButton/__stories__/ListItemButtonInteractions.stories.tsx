import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ListItemButton } from '@ui/components/navigation/ListItemButton/ListItemButton';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { expect, fn, userEvent, within } from 'storybook/test';

const bubbledClicks = fn();
const detailClicks = fn();
const ROW_STYLE = { width: 280 };
const SIBLING_STYLE = { display: 'flex', alignItems: 'center', gap: 8 };

const meta: Meta<typeof ListItemButton> = {
  id: 'ui-components-listitembutton-interactions',
  title: 'UI/Components/Navigation/ListItemButton/Interactions',
  component: ListItemButton,
  decorators: [ComponentDecorator],
  tags: ['!autodocs'],
  args: { children: 'Open record', onClick: fn(), style: ROW_STYLE },
};

export default meta;
type Story = StoryObj<typeof ListItemButton>;

export const NativeActivation: Story = {
  render: (args) => (
    <div role="presentation" onClick={bubbledClicks}>
      <ListItemButton
        {...args}
        ref={(element) => {
          if (isDefined(element)) {
            element.dataset.refTag = element.tagName;
          }
        }}
        onClick={(event) => {
          event.currentTarget.dataset.clickTarget = event.currentTarget.tagName;
          args.onClick?.(event);
        }}
        onFocus={(event) => {
          event.currentTarget.dataset.focusTarget = event.currentTarget.tagName;
        }}
      />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Open record' });
    bubbledClicks.mockClear();

    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveAttribute('data-ref-tag', 'BUTTON');
    await userEvent.click(button);
    expect(button).toHaveFocus();
    expect(button).toHaveAttribute('data-click-target', 'BUTTON');
    expect(button).toHaveAttribute('data-focus-target', 'BUTTON');
    await userEvent.keyboard('{Enter} ');
    expect(args.onClick).toHaveBeenCalledTimes(3);
    expect(bubbledClicks).toHaveBeenCalledTimes(3);
  },
};

export const DisabledBehavior: Story = {
  render: (args) => (
    <>
      <ListItemButton {...args} disabled>
        Unavailable record
      </ListItemButton>
      <ListItemButton {...args} disabled focusableWhenDisabled>
        Focusable unavailable record
      </ListItemButton>
      <Button>Next action</Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabled = canvas.getByRole('button', { name: 'Unavailable record' });
    const focusable = canvas.getByRole('button', {
      name: 'Focusable unavailable record',
    });

    expect(disabled).toBeDisabled();
    disabled.focus();
    expect(disabled).not.toHaveFocus();
    await userEvent.click(disabled);
    expect(focusable).not.toBeDisabled();
    expect(focusable).toHaveAttribute('aria-disabled', 'true');
    focusable.focus();
    expect(focusable).toHaveFocus();
    await userEvent.keyboard('{Enter} ');
    await userEvent.click(focusable);
    expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const IndependentAction: Story = {
  render: (args) => (
    <div style={SIBLING_STYLE}>
      <ListItemButton {...args} />
      <Button onClick={detailClicks}>Details</Button>
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const row = canvas.getByRole('button', { name: 'Open record' });
    const details = canvas.getByRole('button', { name: 'Details' });
    detailClicks.mockClear();

    expect(row.contains(details)).toBe(false);
    await userEvent.click(details);
    await userEvent.keyboard('{Enter} ');
    expect(details).toHaveFocus();
    expect(detailClicks).toHaveBeenCalledTimes(3);
    expect(args.onClick).not.toHaveBeenCalled();
  },
};
