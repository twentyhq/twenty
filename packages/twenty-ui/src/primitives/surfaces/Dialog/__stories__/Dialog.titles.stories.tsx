import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dialog } from '../Dialog';
import { waitForDialog } from './waitForDialog';

const meta: Meta<typeof Dialog.Title> = {
  title: 'UI/Surfaces/Dialog',
  component: Dialog.Title,
  decorators: [ComponentDecorator],
  args: { children: 'Grant credits' },
  render: (args) => (
    <Dialog.Root defaultOpen>
      <Dialog.Popup>
        <Dialog.Header>
          <Dialog.Title {...args} />
          <Dialog.Description>
            Add credits to this workspace.
          </Dialog.Description>
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Close render={<Button>Close</Button>} />
        </Dialog.Footer>
      </Dialog.Popup>
    </Dialog.Root>
  ),
};

export default meta;
type Story = StoryObj<typeof Dialog.Title>;

export const TitleTypography: Story = {
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const title = within(dialog).getByRole('heading', {
      name: 'Grant credits',
      level: 2,
    });
    const titleStyle = getComputedStyle(title);

    expect(title).toHaveAttribute('data-size', 'lg');
    expect(title).toHaveAttribute('data-color', 'primary');
    expect(titleStyle.marginBlockEnd).toBe('16px');
    expect(titleStyle.textAlign).toBe('center');
    expect(dialog).toHaveAttribute('aria-labelledby', title.id);
  },
};

export const CustomTitle: Story = {
  args: {
    level: 3,
    size: 'sm',
    color: 'secondary',
    style: { marginBlockEnd: 24, textAlign: 'left' },
  },
  play: async ({ canvasElement }) => {
    const dialog = await waitForDialog(canvasElement);
    const title = within(dialog).getByRole('heading', {
      name: 'Grant credits',
      level: 3,
    });
    const titleStyle = getComputedStyle(title);
    const description = within(dialog).getByText(
      'Add credits to this workspace.',
    );

    expect(title).toHaveAttribute('data-size', 'sm');
    expect(titleStyle.color).toBe(getComputedStyle(description).color);
    expect(titleStyle.marginBlockEnd).toBe('24px');
    expect(titleStyle.textAlign).toBe('left');
    expect(dialog).toHaveAccessibleName('Grant credits');
  },
};

export const TitleTypographyDark: Story = {
  ...TitleTypography,
  globals: { colorScheme: 'dark' },
};
