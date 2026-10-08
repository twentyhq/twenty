import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { CommandBlock } from '../CommandBlock';

const meta: Meta<typeof CommandBlock> = {
  title: 'UI/Components/Data Display/CommandBlock',
  component: CommandBlock,
  decorators: [ComponentDecorator],
  args: { commands: ['yarn add twenty-ui', 'yarn start'] },
};

export default meta;

type Story = StoryObj<typeof CommandBlock>;

export const Default: Story = {};

export const Documentation: Story = {
  args: {
    actions: (
      <>
        <Text>Ready to install</Text>
        <Button>Copy commands</Button>
      </>
    ),
  },
};

const handleCopy = fn();
const handleRootFocus = fn();
const handleRenderFocus = fn();

export const Composition: Story = {
  args: {
    commands: ['echo "<hello>"', 'yarn start'],
    actions: (
      <>
        <Text
          render={<a href="#documentation" aria-label="Read instructions" />}
        >
          Read instructions
        </Text>
        <Button onClick={handleCopy}>Copy commands</Button>
      </>
    ),
    onFocus: handleRootFocus,
    render: <section aria-label="Installation" onFocus={handleRenderFocus} />,
    ref: (element) => {
      element?.setAttribute('data-ref-target', 'commands');
    },
  },
  play: async ({ canvasElement }) => {
    handleCopy.mockClear();
    handleRootFocus.mockClear();
    handleRenderFocus.mockClear();
    const canvas = within(canvasElement);
    const root = canvas.getByRole('region', { name: 'Installation' });
    await expect(root).toHaveAttribute('data-ref-target', 'commands');
    const code = canvas.getByRole('code');
    await expect(code.parentElement?.tagName).toBe('PRE');
    await expect(code.textContent).toBe('> echo "<hello>"\n> yarn start');
    await userEvent.tab();
    await expect(
      canvas.getByRole('link', { name: 'Read instructions' }),
    ).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    await expect(handleCopy).toHaveBeenCalledTimes(1);
    await expect(handleRootFocus).toHaveBeenCalledTimes(2);
    await expect(handleRenderFocus).toHaveBeenCalledTimes(2);
  },
};

export const LongCommand: Story = {
  args: {
    commands: [
      'yarn add twenty-ui --registry=https://registry.npmjs.org --network-timeout=120000',
    ],
    actions: <Button>Copy</Button>,
  },
  parameters: { container: { width: 260 } },
  play: async ({ canvasElement }) => {
    const root = within(canvasElement)
      .getByRole('code')
      .closest('pre')?.parentElement;
    await expect(root?.scrollWidth).toBe(root?.clientWidth);
  },
};
