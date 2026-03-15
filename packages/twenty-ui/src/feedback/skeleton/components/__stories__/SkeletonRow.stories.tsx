import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { themeCssVariables } from '@ui/theme-constants';

import { SkeletonRow } from '../SkeletonRow';

const StyledListContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const meta: Meta<typeof SkeletonRow> = {
  title: 'UI/Feedback/Skeleton/SkeletonRow',
  component: SkeletonRow,
  decorators: [ComponentDecorator],
  argTypes: {
    hasAvatar: { control: { type: 'boolean' } },
    avatarSize: { control: { type: 'number' } },
    textLines: { control: { type: 'range', min: 1, max: 5, step: 1 } },
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonRow>;

export const Default: Story = {
  args: {
    hasAvatar: true,
    textLines: 2,
  },
  parameters: {
    container: { width: 400 },
  },
};

export const WithoutAvatar: Story = {
  args: {
    hasAvatar: false,
    textLines: 2,
  },
  parameters: {
    container: { width: 400 },
  },
};

export const List: Story = {
  render: () => (
    <StyledListContainer>
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
      <SkeletonRow />
    </StyledListContainer>
  ),
  parameters: {
    container: { width: 400 },
  },
};

export const SmallAvatar: Story = {
  args: {
    hasAvatar: true,
    avatarSize: 24,
    textLines: 1,
    textLineHeight: 16,
  },
  parameters: {
    container: { width: 300 },
  },
};
