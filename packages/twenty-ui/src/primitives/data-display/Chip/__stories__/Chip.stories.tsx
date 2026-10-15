import { expect, fn, userEvent, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconUser, IconX } from '@ui/icon';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Chip } from '@ui/primitives/data-display/Chip/Chip';
import { type ChipSize } from '@ui/primitives/data-display/Chip/types/ChipSize';
import { type ChipVariant } from '@ui/primitives/data-display/Chip/types/ChipVariant';

const meta: Meta<typeof Chip> = {
  title: 'UI/Data Display/Chip',
  component: Chip,
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    children: 'Chip test',
    size: 'sm',
    variant: 'soft',
    color: 'primary',
    maxWidth: 200,
  },
  decorators: [ComponentDecorator],
};

export const WithLeftAvatar: Story = {
  args: {
    children: 'John Doe',
    clickable: true,
    variant: 'ghost',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  decorators: [ComponentDecorator],
};

export const WithLeftIcon: Story = {
  args: {
    children: 'Company',
    clickable: true,
    variant: 'ghost',
    startElement: <IconUser size={14} />,
  },
  decorators: [ComponentDecorator],
};

export const CallerFallback: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: (
      <Text render={<span />} style={{ color: 'var(--t-font-color-tertiary)' }}>
        Untitled
      </Text>
    ),
    clickable: true,
    variant: 'ghost',
    startElement: <Avatar name="?" colorSeed="empty" size="sm" />,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Chip> = {
  args: { clickable: true, children: 'Hello' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      options: { elementContainer: { style: { width: 110 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { render: <button type="button" disabled /> };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithAvatarCatalog: CatalogStory<Story, typeof Chip> = {
  args: {
    clickable: true,
    children: 'John Doe',
    startElement: (
      <Avatar name="JD" colorSeed="John Doe" size="sm" shape="circle" />
    ),
  },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    color: { control: false },
    className: { control: false },
    endElement: { control: false },
    startElement: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      options: { elementContainer: { style: { width: 110 } } },
      dimensions: [
        {
          name: 'variants',
          values: ['ghost', 'soft', 'solid'],
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: ['sm', 'md'],
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) => {
            switch (state) {
              case 'hover':
              case 'active':
                return { className: state };
              case 'disabled':
                return { render: <button type="button" disabled /> };
              default:
                return {};
            }
          },
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const WithRightComponentDivider: Story = {
  args: {
    children: 'document.pdf',
    variant: 'soft',
    startElement: (
      <Avatar name="D" colorSeed="document" size="sm" shape="square" />
    ),
    endElement: <IconX size={14} />,
    endElementDivider: true,
  },
  decorators: [ComponentDecorator],
};

export const CatalogDark: typeof Catalog = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const PointerAndKeyboard: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Open details',
    render: <button type="button" />,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Open details',
    });
    await expect(getComputedStyle(control).cursor).toBe('pointer');
    await userEvent.click(control);
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    await expect(args.onClick).toHaveBeenCalledTimes(3);
    await expect(control).toHaveFocus();
    await expect(args.onClick).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: 'click' }),
    );
  },
};

export const Disabled: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Unavailable',
    render: <button type="button" disabled />,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('button', {
      name: 'Unavailable',
    });
    await expect(control).toBeDisabled();
    await userEvent.click(control);
    await expect(args.onClick).not.toHaveBeenCalled();
  },
};

export const ContentAndSlots: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: <strong>Rich content</strong>,
    startElement: <IconUser />,
    endElement: (
      <Button type="button" aria-label="Remove" onClick={fn()}>
        Remove
      </Button>
    ),
    endElementDivider: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Rich content')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Remove' }));
  },
};

export const StableDefault: Story = {
  decorators: [ComponentDecorator],
  args: { children: 'Presentational chip', onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const chip = canvas.getByText('Presentational chip').parentElement;
    await expect(chip?.tagName).toBe('DIV');
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByText('Presentational chip'));
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
};

export const IconOnly: Story = {
  decorators: [ComponentDecorator],
  args: {
    render: <button type="button" />,
    'aria-label': 'Open profile',
    startElement: <IconUser size={14} aria-hidden />,
    onClick: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('button', { name: 'Open profile' });
    await expect(canvas.queryByText('Untitled')).not.toBeInTheDocument();
    control.focus();
    await userEvent.keyboard('{Enter}');
    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(control).toHaveFocus();
  },
};

export const ExplicitLink: Story = {
  decorators: [ComponentDecorator],
  args: {
    render: <a href="#chip-link" aria-label="https://twenty.com" />,
    children: 'https://twenty.com',
    clickable: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'https://twenty.com' });
    await expect(link).toHaveAttribute('href', '#chip-link');
    await expect(link.querySelector('a')).toBeNull();
    link.focus();
    await expect(link).toHaveFocus();
  },
};

export const TruncationAndTooltip: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: <strong>Quarterly customer research findings.pdf</strong>,
    variant: 'soft',
    maxWidth: 150,
    tooltipContent: 'Research findings\nPDF document',
    tooltipDelay: 0,
    isTooltipMultiline: true,
    tooltipPlace: 'top',
  },
  play: async ({ canvasElement }) => {
    const content = within(canvasElement).getByText(
      'Quarterly customer research findings.pdf',
    ).parentElement;
    if (!isDefined(content)) {
      throw new Error('Chip content must have a text container');
    }
    await expect(content.scrollWidth).toBeGreaterThan(content.clientWidth);
    await expect(getComputedStyle(content).textOverflow).toBe('ellipsis');
    await userEvent.hover(content);
    await expect(
      await within(document.body).findByRole('tooltip'),
    ).toHaveTextContent('Research findings PDF document');
    await userEvent.unhover(content);
    await userEvent.keyboard('{Escape}');
  },
};

export const WithoutTruncation: Story = {
  decorators: [ComponentDecorator],
  args: { children: 'Unconstrained content', truncate: false },
  play: async ({ canvasElement }) => {
    const content = within(canvasElement).getByText('Unconstrained content');
    await expect(getComputedStyle(content).textOverflow).not.toBe('ellipsis');
    const chip = content.parentElement;
    if (!isDefined(chip)) {
      throw new Error('Chip content must have a root');
    }
    await expect(getComputedStyle(chip).overflow).not.toBe('hidden');
  },
};
