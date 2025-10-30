import styled from '@emotion/styled';
import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';
import { AnimatedExpandableContainer } from '../components/AnimatedExpandableContainer';

const StyledButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.color.blue10};
  color: ${({ theme }) => theme.font.color.primary};
  border: none;
  border-radius: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  &:hover {
    background-color: ${({ theme }) => theme.color.blue8};
  }
`;

const StyledButtonWrapper = styled.div<{ dimension: 'width' | 'height' }>`
  ${({ dimension }) => dimension === 'height' && `width: 600px;`}
  ${({ dimension }) => dimension === 'width' && `height: 300px;`}
`;

const StyledExpandableWrapper = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  height: 100%;
  width: 100%;
`;

const StyledContent = styled.div<{
  dimension: 'width' | 'height';
  mode: 'scroll-height' | 'fit-content';
}>`
  padding: ${({ theme }) => theme.spacing(3)};
  ${({ dimension, mode }) =>
    dimension === 'height' && mode === 'scroll-height' && `height: 200px;`}
  ${({ dimension }) => dimension === 'width' && `width: 400px;`}
  
  p {
    color: ${({ theme }) => theme.font.color.primary};
    margin-bottom: ${({ theme }) => theme.spacing(2)};
    font-size: ${({ theme }) => theme.font.size.md};
  }
`;

type AnimatedExpandableContainerWithButtonProps = {
  isExpanded: boolean;
  dimension: 'width' | 'height';
  mode: 'scroll-height' | 'fit-content';
  animationDurations:
    | {
        opacity: number;
        size: number;
      }
    | 'default';
};

const AnimatedExpandableContainerWithButton = ({
  isExpanded: initialIsExpanded,
  ...args
}: AnimatedExpandableContainerWithButtonProps) => {
  const [isExpanded, setIsExpanded] = useState(initialIsExpanded);

  return (
    <StyledButtonWrapper dimension={args.dimension}>
      <StyledButton onClick={() => setIsExpanded(!isExpanded)}>
        {isExpanded ? 'Collapse' : 'Expand'}
      </StyledButton>
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        dimension={args.dimension}
        mode={args.mode}
        animationDurations={args.animationDurations}
      >
        <StyledExpandableWrapper>
          <StyledContent dimension={args.dimension} mode={args.mode}>
            <p>
              This is some content inside the AnimatedExpandableContainer. It
              will animate smoothly when expanding or collapsing.
            </p>
            <p>
              You can control the animation duration, dimension, and mode
              through the Storybook controls.
            </p>
            <p>
              Try different combinations to see how the container behaves with
              different settings!
            </p>
          </StyledContent>
        </StyledExpandableWrapper>
      </AnimatedExpandableContainer>
    </StyledButtonWrapper>
  );
};

const meta: Meta<typeof AnimatedExpandableContainerWithButton> = {
  title: 'UI/Layout/AnimatedExpandableContainer',
  component: AnimatedExpandableContainerWithButton,
  decorators: [ComponentDecorator],
  argTypes: {
    isExpanded: {
      control: 'boolean',
      description: 'Controls whether the container is expanded or collapsed',
      defaultValue: false,
    },
    dimension: {
      control: 'radio',
      options: ['width', 'height'],
      description: 'The dimension along which the container expands',
      defaultValue: 'height',
    },
    mode: {
      control: 'radio',
      options: ['scroll-height', 'fit-content'],
      description: 'How the container should calculate its expanded size',
      defaultValue: 'scroll-height',
    },
    animationDurations: {
      control: 'radio',
      options: ['default', 'custom'],
      mapping: {
        default: 'default',
        custom: { opacity: 0.3, size: 0.3 },
      },
      description:
        'Animation durations - either default theme values or custom values',
    },
  },
};

export default meta;
type Story = StoryObj<typeof AnimatedExpandableContainerWithButton>;

export const Default: Story = {
  args: {
    isExpanded: false,
    dimension: 'height',
    mode: 'scroll-height',
    animationDurations: 'default',
  },
};

export const FitContent: Story = {
  args: {
    ...Default.args,
    mode: 'fit-content',
  },
};

export const CustomDurations: Story = {
  args: {
    ...Default.args,
    animationDurations: { opacity: 0.8, size: 1.2 },
  },
};

export const WidthAnimation: Story = {
  args: {
    ...Default.args,
    dimension: 'width',
  },
};
