import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { MemoryRouter } from 'react-router-dom';

import { ChipAccent, ChipSize, ChipVariant } from '../Chip';
import { LinkChip } from '../LinkChip';

const meta: Meta<typeof LinkChip> = {
  title: 'UI/Display/Chip/LinkChip',
  component: LinkChip,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <Story />
      </MemoryRouter>
    ),
    ComponentDecorator,
  ],
};

export default meta;
type Story = StoryObj<typeof LinkChip>;

export const Default: Story = {
  args: {
    label: 'Link Chip',
    to: '/example',
    size: ChipSize.Small,
    variant: ChipVariant.Regular,
    accent: ChipAccent.TextPrimary,
  },
};
