import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { NumberStepper } from '../NumberStepper';
import { NumberStepperFieldExample } from './NumberStepperFieldExample';
import { NumberStepperFormExample } from './NumberStepperFormExample';

const meta: Meta<typeof NumberStepper> = {
  title: 'UI/Input/NumberStepper/Forms',
  component: NumberStepper,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    'aria-label': 'Quantity',
    defaultValue: 1,
    min: 0,
    max: 2,
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NumberStepper>;

export const FormSubmission: Story = {
  render: (args) => <NumberStepperFormExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const savedQuantity = canvas.getByLabelText('Saved quantity');
    const submissionCount = canvas.getByLabelText('Submission count');

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('2');
    await expect(savedQuantity).toHaveTextContent('Not saved');
    await expect(submissionCount).toHaveTextContent('0');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(savedQuantity).toHaveTextContent('2');
    await expect(submissionCount).toHaveTextContent('1');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const SmallFractionalStep: Story = {
  args: { defaultValue: 0, step: 0.0001 },
  render: (args) => <NumberStepperFormExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('0.0001');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      0.0001,
      expect.anything(),
    );
    await userEvent.click(input);
    await userEvent.tab();
    await expect(input).toHaveValue('0.0001');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(canvas.getByLabelText('Saved quantity')).toHaveTextContent(
      '0.0001',
    );
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
  },
};

export const ExternalForm: Story = {
  render: (args) => <NumberStepperFormExample {...args} external />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(canvas.getByLabelText('Saved quantity')).toHaveTextContent(
      '1',
    );
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '1',
    );
  },
};

export const Required: Story = {
  args: { defaultValue: undefined, required: true },
  render: (args) => <NumberStepperFormExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await expect(input).toBeRequired();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(input).toBeInvalid();
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '0',
    );
    await userEvent.type(input, '2');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(canvas.getByLabelText('Saved quantity')).toHaveTextContent(
      '2',
    );
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '1',
    );
  },
};

export const WithFieldAndRef: Story = {
  render: (args) => <NumberStepperFieldExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.click(canvas.getByText('Quantity', { selector: 'label' }));
    await expect(input).toHaveFocus();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAccessibleDescription(
      'Choose a quantity between zero and two. Check the quantity.',
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Focus quantity' }),
    );
    await expect(input).toHaveFocus();
  },
};

export const OutOfRangeValidation: Story = {
  args: { defaultValue: 60, min: 30, max: 90, allowOutOfRange: true },
  render: (args) => <NumberStepperFormExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const saveButton = canvas.getByRole('button', { name: 'Save quantity' });

    await userEvent.tripleClick(input);
    await userEvent.keyboard('999');
    await userEvent.click(saveButton);
    await expect(input).toHaveValue('999');
    await expect(input.closest('form')).toBeInvalid();
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '0',
    );
    await userEvent.tripleClick(input);
    await userEvent.keyboard('60');
    await userEvent.click(saveButton);
    await expect(canvas.getByLabelText('Saved quantity')).toHaveTextContent(
      '60',
    );
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '1',
    );
  },
};

export const DisabledSubmission: Story = {
  args: { disabled: true },
  render: (args) => <NumberStepperFormExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('textbox', { name: 'Quantity' }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(canvas.getByLabelText('Saved quantity')).toBeEmptyDOMElement();
    await expect(canvas.getByLabelText('Submission count')).toHaveTextContent(
      '1',
    );
  },
};
