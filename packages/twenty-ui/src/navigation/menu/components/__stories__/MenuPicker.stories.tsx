import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconChartPie, TooltipDelay } from '@ui/display';
import { MenuPicker } from '@ui/navigation/menu/components/MenuPicker';
import { ComponentDecorator } from '@ui/testing';
import { type ReactNode, useContext } from 'react';
import { ThemeContext, type ThemeType } from '@ui/theme';

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

const StyledTitle = styled.h4<{ theme: ThemeType }>`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: 12px;
  margin-bottom: 8px;
`;

const SectionTitle = ({ children }: { children?: ReactNode }) => {
  const { theme } = useContext(ThemeContext);
  return <StyledTitle theme={theme}>{children}</StyledTitle>;
};

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
        <SectionTitle>Default</SectionTitle>
        <MenuPicker id="default" icon={IconChartPie} label="Default" />
      </div>
      <div>
        <SectionTitle>Selected</SectionTitle>
        <MenuPicker
          id="selected"
          icon={IconChartPie}
          label="Selected"
          selected
        />
      </div>
      <div>
        <SectionTitle>Disabled</SectionTitle>
        <MenuPicker
          id="disabled"
          icon={IconChartPie}
          label="Disabled"
          disabled
        />
      </div>
      <div>
        <SectionTitle>No Label</SectionTitle>
        <MenuPicker
          id="no-label"
          icon={IconChartPie}
          label="No Label"
          showLabel={false}
        />
      </div>
      <div>
        <SectionTitle>With Tooltip</SectionTitle>
        <MenuPicker
          id="tooltip"
          icon={IconChartPie}
          label="Tooltip"
          tooltipContent="Tooltip"
          tooltipDelay={TooltipDelay.mediumDelay}
        />
      </div>
    </div>
  ),
};
