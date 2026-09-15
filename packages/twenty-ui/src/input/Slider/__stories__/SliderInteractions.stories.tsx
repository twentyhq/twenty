import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field } from '@ui/input/Field/Field';
import { ComponentDecorator } from '@ui/testing';

import { Slider } from '../Slider';
import { type SliderRootProps } from '../types/SliderRootProps';

const SliderExample = (props: SliderRootProps) => (
  <Slider.Root {...props}>
    <Slider.Control data-testid="slider-control">
      <Slider.Track>
        <Slider.Indicator />
        <Slider.Thumb aria-label="Volume" />
      </Slider.Track>
    </Slider.Control>
  </Slider.Root>
);

const ControlledSliderExample = (props: SliderRootProps) => {
  const [value, setValue] = useState(40);

  return (
    <div style={{ width: '100%' }}>
      <SliderExample {...props} value={value} />
      <button type="button" onClick={() => setValue(60)}>
        Apply volume
      </button>
    </div>
  );
};

const FormSliderExample = () => {
  const [submittedValue, setSubmittedValue] = useState('');

  return (
    <form
      style={{ width: '100%' }}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmittedValue(
          String(new FormData(event.currentTarget).get('volume')),
        );
      }}
    >
      <SliderExample name="volume" defaultValue={40} />
      <button type="submit">Save volume</button>
      <p>Saved volume: {submittedValue}</p>
    </form>
  );
};

const meta = {
  title: 'UI/Input/Slider/Interactions',
  component: Slider.Root<number>,
  args: { defaultValue: 40, onValueChange: fn(), onValueCommitted: fn() },
  parameters: { container: { width: 240 } },
  render: (args) => <SliderExample {...args} />,
} satisfies Meta<typeof Slider.Root<number>>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Keyboard: Story = {
  decorators: [ComponentDecorator],
  args: { min: 10, max: 90, step: 5, largeStep: 20 },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(slider).toHaveValue('45');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      45,
      expect.objectContaining({ reason: 'keyboard' }),
    );
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      45,
      expect.objectContaining({ reason: 'keyboard' }),
    );

    await userEvent.keyboard('{PageUp}');
    await expect(slider).toHaveValue('65');
    await userEvent.keyboard('{PageDown}');
    await expect(slider).toHaveValue('45');
    await userEvent.keyboard('{Home}{ArrowLeft}');
    await expect(slider).toHaveValue('10');
    await userEvent.keyboard('{End}{ArrowRight}');
    await expect(slider).toHaveValue('90');
  },
};

export const PointerDrag: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole<HTMLInputElement>('slider', {
      name: 'Volume',
    });
    const control = canvas.getByTestId('slider-control');
    const pointer = userEvent.setup();
    const bounds = control.getBoundingClientRect();
    const y = bounds.top + bounds.height / 2;

    await pointer.pointer({
      target: control,
      keys: '[MouseLeft>]',
      coords: { x: bounds.left + bounds.width / 4, y },
    });
    await expect(slider.valueAsNumber).toBeLessThan(40);
    await expect(args.onValueCommitted).not.toHaveBeenCalled();

    await pointer.pointer({
      target: control,
      coords: { x: bounds.left + (bounds.width * 3) / 4, y },
    });
    await expect(slider.valueAsNumber).toBeGreaterThan(60);
    await expect(args.onValueCommitted).not.toHaveBeenCalled();

    await pointer.pointer({ target: control, keys: '[/MouseLeft]' });
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      slider.valueAsNumber,
      expect.objectContaining({ reason: 'drag' }),
    );
  },
};

export const Controlled: Story = {
  decorators: [ComponentDecorator],
  render: (args) => <ControlledSliderExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      41,
      expect.anything(),
    );
    await expect(slider).toHaveValue('40');

    await userEvent.click(canvas.getByRole('button', { name: 'Apply volume' }));
    await expect(slider).toHaveValue('60');
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });

    await expect(slider).toBeDisabled();
    await userEvent.click(canvas.getByTestId('slider-control'));
    await expect(slider).toHaveValue('40');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const CanceledChange: Story = {
  decorators: [ComponentDecorator],
  args: { onValueChange: fn((_value, details) => details.cancel()) },
  play: async ({ canvasElement, args }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(args.onValueChange).toHaveBeenCalled();
    await expect(slider).toHaveValue('40');
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const FormSubmission: Story = {
  decorators: [ComponentDecorator],
  render: () => <FormSliderExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });

    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await userEvent.click(canvas.getByRole('button', { name: 'Save volume' }));
    await expect(canvas.getByText('Saved volume: 41')).toBeVisible();
  },
};

export const WithField: Story = {
  decorators: [ComponentDecorator],
  render: (args) => (
    <Field.Root invalid style={{ width: '100%' }}>
      <Field.Label style={{ color: 'var(--t-font-color-primary)' }}>
        Volume
      </Field.Label>
      <Field.Description style={{ color: 'var(--t-font-color-primary)' }}>
        Choose a comfortable listening level
      </Field.Description>
      <Slider.Root {...args}>
        <Slider.Control>
          <Slider.Track>
            <Slider.Indicator />
            <Slider.Thumb />
          </Slider.Track>
        </Slider.Control>
      </Slider.Root>
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });

    await expect(slider).toHaveAccessibleDescription(
      'Choose a comfortable listening level',
    );
    await expect(slider).toHaveAttribute('aria-invalid', 'true');
  },
};

export const FunctionProps: Story = {
  decorators: [ComponentDecorator],
  args: {
    className: (state) =>
      state.values[0] === 40 ? 'initial-volume' : 'changed-volume',
    style: (state) => ({ opacity: state.disabled ? 0.5 : 1 }),
    render: (props, state) => (
      <section {...props} data-volume={state.values[0]} />
    ),
  },
  play: async ({ canvasElement }) => {
    const slider = within(canvasElement).getByRole('slider', {
      name: 'Volume',
    });
    const root = slider.closest('section');

    await expect(root).toHaveClass('initial-volume');
    await expect(root).toHaveStyle({ opacity: '1' });
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(root).toHaveClass('changed-volume');
    await expect(root).toHaveAttribute('data-volume', '41');
  },
};
