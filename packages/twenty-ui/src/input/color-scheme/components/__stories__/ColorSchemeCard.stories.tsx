import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';

import { ColorSchemeCard } from '../ColorSchemeCard';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

const meta: Meta<typeof ColorSchemeCard> = {
  title: 'UI/Input/ColorScheme/ColorSchemeCard',
  component: ColorSchemeCard,
  decorators: [
    (Story) => (
      <StyledContainer>
        <Story />
      </StyledContainer>
    ),
    ComponentDecorator,
  ],
  argTypes: {
    variant: { control: false },
  },
  args: { selected: false },
};

export default meta;
type Story = StoryObj<typeof ColorSchemeCard>;

export const Default: Story = {
  render: (args) => (
    <>
      <ColorSchemeCard variant="Light" selected={args.selected} />
      <ColorSchemeCard variant="Dark" selected={args.selected} />
      <ColorSchemeCard variant="System" selected={args.selected} />
    </>
  ),
};

export const Selected: Story = {
  ...Default,
  args: { selected: true },
};
