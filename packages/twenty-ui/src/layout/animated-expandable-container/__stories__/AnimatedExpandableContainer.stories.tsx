import { styled } from '@linaria/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';
import { themeCssVariables } from '@ui/theme-constants';
import { AnimatedExpandableContainer } from '../components/AnimatedExpandableContainer';

const StyledButton = styled.button`
  padding: ${themeCssVariables.spacing['2']} ${themeCssVariables.spacing['4']};
  background-color: ${themeCssVariables.color.blue10};
  color: ${themeCssVariables.font.color.primary};
  border: none;
  border-radius: ${themeCssVariables.spacing['1']};
  cursor: pointer;
  margin-bottom: ${themeCssVariables.spacing['3']};

  &:hover {
    background-color: ${themeCssVariables.color.blue8};
  }
`;

const StyledButtonWrapper = styled.div<{ dimension: 'width' | 'height' }>`
  height: ${({ dimension }) => (dimension === 'width' ? '300px' : 'auto')};
  width: ${({ dimension }) => (dimension === 'height' ? '600px' : 'auto')};
`;

const StyledExpandableWrapper = styled.div`
  background-color: ${themeCssVariables.background.primary};
  height: 100%;
  width: 100%;
`;

const StyledContent = styled.div<{
  dimension: 'width' | 'height';
  mode: 'scroll-height' | 'fit-content';
}>`
  padding: ${themeCssVariables.spacing['3']};
  height: ${({ dimension, mode }) =>
    dimension === 'height' && mode === 'scroll-height' ? '200px' : 'auto'};
  width: ${({ dimension }) => (dimension === 'width' ? '400px' : 'auto')};

  p {
    color: ${themeCssVariables.font.color.primary};
    margin-bottom: ${themeCssVariables.spacing['2']};
    font-size: ${themeCssVariables.font.size.md};
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
