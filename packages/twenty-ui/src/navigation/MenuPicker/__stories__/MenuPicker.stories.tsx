import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconChartPie } from '@ui/icon';
import { TooltipDelay } from '@ui/surfaces';
import { MenuPicker } from '@ui/navigation/MenuPicker/MenuPicker';
import { ComponentDecorator } from '@ui/testing';
import { type ReactNode } from 'react';

import styles from './MenuPicker.stories.module.scss';

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

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
};

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

const SectionTitle = ({ children }: { children?: ReactNode }) => {
  return <h4 className={styles.title}>{children}</h4>;
};

export const AllStates: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
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
