import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type CSSProperties, useState } from 'react';

import { IconX } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Popover } from '../Popover';
import { type PopoverPopupProps } from '../types/PopoverPopupProps';
import { type PopoverRootProps } from '../types/PopoverRootProps';
import { type PopoverSide } from '../types/PopoverSide';

type PopoverStoryProps = PopoverRootProps &
  Pick<PopoverPopupProps, 'side' | 'align' | 'arrow'>;

const PopoverStory = ({ side, align, arrow, ...props }: PopoverStoryProps) => (
  <Popover.Root {...props}>
    <Popover.Trigger style={{ alignSelf: 'flex-start', marginInline: 'auto' }}>
      Open
    </Popover.Trigger>
    <Popover.Popup side={side} align={align} arrow={arrow}>
      <Popover.Title>Details</Popover.Title>
      <Popover.Description>More information</Popover.Description>
      <Popover.Close aria-label="Close" style={{ alignSelf: 'flex-start' }}>
        <IconX size={16} />
      </Popover.Close>
    </Popover.Popup>
  </Popover.Root>
);

const meta: Meta<typeof PopoverStory> = {
  title: 'UI/Surfaces/Popover',
  component: PopoverStory,
};

export default meta;
type Story = StoryObj<typeof PopoverStory>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 200 } },
  args: { defaultOpen: true },
};
export const WithArrow: Story = {
  ...Default,
  args: { defaultOpen: true, arrow: true },
};
export const TrapFocus: Story = {
  ...Default,
  args: { defaultOpen: true, modal: 'trap-focus' },
};

const POPOVER_CATALOG_ALIGNMENT: Record<PopoverSide, CSSProperties> = {
  bottom: { alignItems: 'flex-start', justifyContent: 'center' },
  top: { alignItems: 'flex-end', justifyContent: 'center' },
  left: { alignItems: 'center', justifyContent: 'flex-end' },
  right: { alignItems: 'center', justifyContent: 'flex-start' },
  'inline-end': { alignItems: 'center', justifyContent: 'flex-start' },
  'inline-start': { alignItems: 'center', justifyContent: 'flex-end' },
};

const PopoverCatalogCell = ({ side = 'bottom', arrow }: PopoverStoryProps) => {
  const [cellElement, setCellElement] = useState<HTMLDivElement | null>(null);

  return (
    <div
      ref={setCellElement}
      style={{
        position: 'relative',
        display: 'flex',
        width: 180,
        height: 100,
        ...POPOVER_CATALOG_ALIGNMENT[side],
      }}
    >
      <Popover.Root open modal={false}>
        <Popover.Trigger
          aria-label={`Open ${side} popover ${arrow ? 'with' : 'without'} arrow`}
        >
          Open
        </Popover.Trigger>
        <Popover.Popup container={cellElement} side={side} arrow={arrow}>
          <Popover.Title>Details</Popover.Title>
          <Popover.Description>More information</Popover.Description>
        </Popover.Popup>
      </Popover.Root>
    </div>
  );
};

export const Catalog: CatalogStory<Story, typeof PopoverStory> = {
  render: (args) => <PopoverCatalogCell {...args} />,
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'arrow',
          values: ['none', 'arrow'],
          props: (arrow: string) => ({ arrow: arrow === 'arrow' }),
        },
        {
          name: 'side',
          values: [
            'bottom',
            'top',
            'inline-end',
            'inline-start',
          ] satisfies PopoverSide[],
          props: (side: PopoverSide) => ({ side }),
        },
      ],
      options: { elementContainer: { style: { width: 180, height: 100 } } },
    },
  },
};
export const CatalogDark: CatalogStory<Story, typeof PopoverStory> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
