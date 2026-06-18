import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Info, type InfoAccent } from '@ui/feedback/Info/Info';

const meta: Meta<typeof Info> = {
  title: 'UI/Feedback/Info',
  component: Info,
};

export default meta;
type Story = StoryObj<typeof Info>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    accent: 'blue',
    text: 'An info component',
    buttonTitle: 'Update',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Info> = {
  args: {
    text: 'An info component',
    buttonTitle: 'Update',
  },
  argTypes: {
    accent: { control: false },
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
    catalog: {
      dimensions: [
        {
          name: 'accents',
          values: ['blue', 'danger'] satisfies InfoAccent[],
          props: (accent: InfoAccent) => ({ accent }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
