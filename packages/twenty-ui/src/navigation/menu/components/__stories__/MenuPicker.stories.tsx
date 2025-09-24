import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { IconChartPie } from '@ui/display';
import { MenuPicker } from '@ui/navigation/menu/components/MenuPicker';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof MenuPicker> = {
  title: 'UI/Navigation/Menu/MenuPicker',
  component: MenuPicker,
  decorators: [ComponentDecorator],
  args: {
    icon: IconChartPie,
    label: 'Chart',
    selected: false,
    disabled: false,
    showLabel: true,
  },
  argTypes: {
    icon: {
      control: false,
    },
    onClick: {
      action: 'clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MenuPicker>;

export const Default: Story = {};

export const Selected: Story = {
  args: {
    selected: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithoutLabel: Story = {
  args: {
    showLabel: false,
  },
};

const StyledTitle = styled.h4`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 12px;
  margin-bottom: 8px;
`;

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        width: '100%',
        gap: '16px',
      }}
    >
      <div>
        <StyledTitle>Default</StyledTitle>
        <MenuPicker icon={IconChartPie} label="Default" />
      </div>
      <div>
        <StyledTitle>Selected</StyledTitle>
        <MenuPicker icon={IconChartPie} label="Selected" selected />
      </div>
      <div>
        <StyledTitle>Disabled</StyledTitle>
        <MenuPicker icon={IconChartPie} label="Disabled" disabled />
      </div>
      <div>
        <StyledTitle>No Label</StyledTitle>
        <MenuPicker icon={IconChartPie} label="No Label" showLabel={false} />
      </div>
    </div>
  ),
};
