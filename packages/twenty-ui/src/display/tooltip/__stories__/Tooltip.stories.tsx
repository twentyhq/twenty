import { Meta, StoryObj } from '@storybook/react';

import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import {
  AppTooltip as Tooltip,
  TooltipDelay,
  TooltipPosition,
} from '../AppTooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Display/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    place: TooltipPosition.Bottom,
    delay: TooltipDelay.mediumDelay,
    content: 'Tooltip Test',
    isOpen: true,
    anchorSelect: '#hover-text',
  },
  decorators: [ComponentDecorator],
  render: ({
    anchorSelect,
    className,
    content,
    delay,
    isOpen,
    noArrow,
    offset,
    place,
    positionStrategy,
    clickable,
  }) => (
    <>
      <p id="hover-text" data-testid="tooltip">
        Hover me!
      </p>
      <Tooltip
        {...{
          anchorSelect,
          className,
          content,
          delay,
          isOpen,
          noArrow,
          offset,
          place,
          positionStrategy,
          clickable,
        }}
      />
    </>
  ),
};

export const Hoverable: Story = {
  args: {
    place: TooltipPosition.Bottom,
    delay: TooltipDelay.mediumDelay,
    content: 'Tooltip Test',
    isOpen: true,
    anchorSelect: '#hover-text',
  },
  decorators: [ComponentDecorator],
  render: ({
    anchorSelect,
    className,
    content,
    delay,
    noArrow,
    offset,
    place,
    positionStrategy,
  }) => (
    <>
      <p id="hover-text" data-testid="tooltip">
        Hover me!
      </p>
      <Tooltip
        {...{
          anchorSelect,
          className,
          content,
          delay,
          noArrow,
          offset,
          place,
          positionStrategy,
        }}
      />
    </>
  ),
};

export const Catalog: CatalogStory<Story, typeof Tooltip> = {
  args: { isOpen: true, content: 'Tooltip Test' },
  play: async ({ canvasElement }) => {
    Object.values(TooltipPosition).forEach((position) => {
      const element = canvasElement.querySelector(
        `#${position}`,
      ) as HTMLElement;
      element.style.margin = '75px';
    });
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'anchorSelect',
          values: Object.values(TooltipPosition),
          props: (anchorSelect: TooltipPosition) => ({
            anchorSelect: `#${anchorSelect}`,
            place: anchorSelect,
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
