import {
  type Decorator,
  type Meta,
  type StoryObj,
} from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography';
import { themeCssVariables } from '@ui/theme';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { PopupTrigger as PopupTriggerStory } from './Button.stories';

const InheritedSurface: Decorator = (Story) => (
  <Text
    style={{
      background: themeCssVariables.color.blue,
      color: themeCssVariables.font.color.onAccent,
      display: 'flex',
      flexWrap: 'wrap',
      gap: themeCssVariables.spacing[2],
      padding: themeCssVariables.spacing[4],
    }}
  >
    <Story />
  </Text>
);

const meta: Meta<typeof Button> = {
  title: 'UI/Input/Button/Inherited Color',
  component: Button,
  decorators: [InheritedSurface],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Variants: Story = {
  args: { onClick: fn() },
  render: ({ onClick }) => (
    <>
      {(['outline', 'ghost', 'soft', 'link'] as const).map((variant) => (
        <Button
          key={variant}
          color="inherit"
          variant={variant}
          startIcon={<IconPlus />}
          onClick={onClick}
        >
          {variant}
        </Button>
      ))}
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const variant of ['outline', 'ghost', 'soft', 'link']) {
      const button = canvas.getByRole('button', { name: variant });
      const parent = button.parentElement;

      if (!isDefined(parent)) {
        throw new Error('Inherited buttons must have a colored surface');
      }

      const inheritedColor = getComputedStyle(parent).color;

      await expect(getComputedStyle(button).color).toBe(inheritedColor);
      await expect(button.querySelector('svg')).toHaveStyle({
        color: inheritedColor,
      });
      await userEvent.click(button);
    }

    await expect(args.onClick).toHaveBeenCalledTimes(4);
  },
};

export const DisabledAndLoading: Story = {
  args: { onClick: fn() },
  render: ({ onClick }) => (
    <>
      <Button color="inherit" variant="ghost" disabled onClick={onClick}>
        Disabled
      </Button>
      <Button color="inherit" variant="soft" loading onClick={onClick}>
        Loading
      </Button>
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledButton = canvas.getByRole('button', { name: 'Disabled' });
    const loadingButton = canvas.getByRole('button', { name: 'Loading' });
    const loader = loadingButton.querySelector('div');

    await expect(disabledButton).toBeDisabled();
    await expect(loadingButton).toBeDisabled();
    await expect(loadingButton).toHaveAttribute('aria-busy', 'true');
    await expect(loader).toHaveStyle({
      borderColor: getComputedStyle(loadingButton).color,
    });
    await userEvent.click(disabledButton);
    await userEvent.click(loadingButton);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const PressedPopupState: Story = {
  render: () => (
    <>
      <Button
        color="inherit"
        variant="soft"
        aria-pressed="true"
        data-popup-open
      >
        Pressed open
      </Button>
      <Button color="inherit" variant="soft" aria-pressed="true">
        Pressed closed
      </Button>
      <Button color="inherit" variant="outline" disabled data-popup-open>
        Disabled open
      </Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const pressedOpen = canvas.getByRole('button', { name: 'Pressed open' });
    const pressedClosed = canvas.getByRole('button', {
      name: 'Pressed closed',
    });
    const disabledOpen = canvas.getByRole('button', { name: 'Disabled open' });

    await expect(getComputedStyle(pressedOpen).backgroundColor).toBe(
      getComputedStyle(pressedClosed).backgroundColor,
    );
    await expect(disabledOpen).toBeDisabled();
    await expect(getComputedStyle(disabledOpen).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
  },
};

export const PopupTrigger: Story = {
  ...PopupTriggerStory,
  decorators: [InheritedSurface],
  args: { ...PopupTriggerStory.args, color: 'inherit' },
};
