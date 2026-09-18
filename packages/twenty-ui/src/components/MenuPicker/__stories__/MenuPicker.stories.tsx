import { type Meta, type StoryObj } from '@storybook/react-vite';
import { MenuPicker } from '@ui/components/MenuPicker/MenuPicker';
import { IconChartPie } from '@ui/icon';
import { Heading } from '@ui/primitives/typography/Heading/Heading';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
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
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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
  return (
    <Heading className={styles.title} level={3} size="lg">
      {children}
    </Heading>
  );
};

export const AllStates: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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
          tooltipDelay={500}
        />
      </div>
    </div>
  ),
};
