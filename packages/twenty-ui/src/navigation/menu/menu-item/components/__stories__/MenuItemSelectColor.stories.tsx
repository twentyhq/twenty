import { type Meta, type StoryObj } from '@storybook/react';

import { type ColorSampleVariant } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MAIN_COLOR_NAMES, type ThemeColor } from '@ui/theme';
import { MenuItemSelectColor } from '../MenuItemSelectColor';

const meta: Meta<typeof MenuItemSelectColor> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemSelectColor',
  component: MenuItemSelectColor,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelectColor>;

export const Default: Story = {
  args: { color: 'green' },
  argTypes: { className: { control: false } },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelectColor> = {
  argTypes: { className: { control: false } },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'color',
          values: MAIN_COLOR_NAMES,
          props: (color: ThemeColor) => ({ color }),
          labels: (color: ThemeColor) => color,
        },
        {
          name: 'states',
          values: [
            'default',
            'hover',
            'disabled',
            'selected',
            'hover+selected',
          ],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              case 'disabled':
                return { disabled: true };
              case 'selected':
                return { selected: true };

              case 'hover+selected':
                return { className: 'hover', selected: true };
              default:
                return {};
            }
          },
        },
        {
          name: 'variant',
          values: ['default', 'pipeline'],
          props: (variant: ColorSampleVariant) => ({ variant }),
          labels: (variant: ColorSampleVariant) => variant,
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: {
          width: 200,
        },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
