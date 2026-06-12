import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { ColorSchemeCard } from '../ColorSchemeCard';

import styles from './ColorSchemeCard.stories.module.scss';

const meta: Meta<typeof ColorSchemeCard> = {
  title: 'UI/Input/ColorScheme/ColorSchemeCard',
  component: ColorSchemeCard,
  decorators: [
    (Story) => {
      return (
        <div className={styles.container}>
          <Story />
        </div>
      );
    },
    ComponentDecorator,
  ],
  argTypes: {
    variant: { control: false },
  },
  args: { selected: false },
};

export default meta;
type Story = StoryObj<typeof ColorSchemeCard>;

export const Default: Story = {
  render: (args) => (
    <>
      <ColorSchemeCard variant="Light" selected={args.selected} />
      <ColorSchemeCard variant="Dark" selected={args.selected} />
      <ColorSchemeCard variant="System" selected={args.selected} />
    </>
  ),
};

export const Selected: Story = {
  ...Default,
  args: { selected: true },
};
