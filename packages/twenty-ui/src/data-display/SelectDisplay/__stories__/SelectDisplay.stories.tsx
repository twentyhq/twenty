import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconUser } from '@ui/icon/components/TablerIcons';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor, MAIN_COLOR_NAMES } from '@ui/theme';

import { SelectDisplay } from '@ui/data-display/SelectDisplay/SelectDisplay';

const meta: Meta<typeof SelectDisplay> = {
  title: 'UI/Data Display/SelectDisplay',
  component: SelectDisplay,
  args: {
    label: 'Option',
    color: 'green',
  },
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof SelectDisplay>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export const WithIcon: Story = {
  args: {
    Icon: IconUser,
  },
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export const Catalog: CatalogStory<Story, typeof SelectDisplay> = {
  argTypes: {
    color: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'colors',
          values: MAIN_COLOR_NAMES,
          props: (color: ThemeColor) => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
