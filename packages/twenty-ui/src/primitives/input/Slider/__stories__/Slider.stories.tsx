import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Slider } from '../Slider';
import { type SliderRootProps } from '../types/SliderRootProps';

const meta = {
  title: 'UI/Input/Slider',
  component: Slider.Root<number>,
  args: { defaultValue: 40 },
  render: (args) => (
    <Slider.Root {...args}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb aria-label="Volume" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  ),
} satisfies Meta<typeof Slider.Root<number>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
};

export const WithLabelAndValue: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  render: (args) => (
    <Slider.Root {...args}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Slider.Label>Volume</Slider.Label>
        <Slider.Value />
      </div>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');

    await expect(slider).toHaveValue('41');
    await expect(canvas.getByRole('status')).toHaveTextContent('41');
  },
};

export const Range: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  render: () => (
    <Slider.Root defaultValue={[25, 75]} minStepsBetweenValues={10}>
      <Slider.Control>
        <Slider.Track>
          <Slider.Indicator />
          <Slider.Thumb index={0} aria-label="Minimum price" />
          <Slider.Thumb index={1} aria-label="Maximum price" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const minimum = canvas.getByRole('slider', { name: 'Minimum price' });
    const maximum = canvas.getByRole('slider', { name: 'Maximum price' });

    minimum.focus();
    await userEvent.keyboard('{End}');

    await expect(minimum).toHaveValue('65');
    await expect(maximum).toHaveValue('75');

    await userEvent.tab();
    await expect(maximum).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(maximum).toHaveValue('76');
  },
};

export const Vertical: Story = {
  ...Default,
  args: { orientation: 'vertical' },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });

    slider.focus();
    await userEvent.keyboard('{ArrowUp}');
    await expect(slider).toHaveValue('41');
    await expect(slider).toHaveAttribute('aria-orientation', 'vertical');
  },
};

export const RightToLeft: Story = {
  ...Default,
  render: (args) => (
    <DirectionProvider direction="rtl">
      <div dir="rtl" style={{ width: '100%' }}>
        {meta.render(args)}
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });

    slider.focus();
    await userEvent.keyboard('{ArrowLeft}');
    await expect(slider).toHaveValue('41');
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveValue('40');
  },
};

export const Catalog: CatalogStory<Story, typeof Slider.Root<number>> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'color',
          values: ['accent', 'success'],
          props: (color: SliderRootProps['color']) => ({ color }),
        },
        {
          name: 'state',
          values: ['minimum', 'middle', 'maximum', 'disabled'],
          props: (state: string) => ({
            defaultValue:
              state === 'minimum' ? 0 : state === 'maximum' ? 100 : 50,
            disabled: state === 'disabled',
          }),
        },
      ],
      options: { elementContainer: { style: { width: 160 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof Slider.Root<number>> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
