import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { VisuallyHidden } from '../components/VisuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
  title: 'UI/Accessibility/VisuallyHidden',
  component: VisuallyHidden,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const AccessibleDescription: Story = {
  render: () => {
    return (
      <>
        <Button aria-describedby="action-description">
          <IconPlus aria-hidden />
          <VisuallyHidden>Add record</VisuallyHidden>
        </Button>
        <VisuallyHidden id="action-description">
          Creates a contact
        </VisuallyHidden>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Add record' }),
    ).toHaveAccessibleDescription('Creates a contact');
    await expect(canvas.getByText('Add record').tagName).toBe('SPAN');
  },
};
