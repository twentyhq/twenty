import { Meta, StoryObj } from '@storybook/react';

import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { AppTooltip as Tooltip, TooltipPosition } from '../AppTooltip';

const meta: Meta<typeof Tooltip> = {
  title: 'UI/Display/Tooltip',
  component: Tooltip,
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  args: {
    place: TooltipPosition.Bottom,
    content: 'Tooltip Test',
    isOpen: true,
    anchorSelect: '#hover-text',
  },
  decorators: [ComponentDecorator],
  render: ({
    anchorSelect,
    className,
    content,
    delayHide,
    isOpen,
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
          delayHide,
          isOpen,
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
