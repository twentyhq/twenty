import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { Section, SectionAlignment, SectionFontColor } from '../Section';

const meta: Meta<typeof Section> = {
  title: 'UI/Layout/Section',
  component: Section,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    children: 'Section content goes here',
  },
};

export const Centered: Story = {
  args: {
    children: 'Centered section content',
    alignment: SectionAlignment.Center,
  },
};

export const SecondaryColor: Story = {
  args: {
    children: 'Secondary font color section',
    fontColor: SectionFontColor.Secondary,
  },
};
