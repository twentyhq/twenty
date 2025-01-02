import styled from '@emotion/styled';
import { Meta, StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';
import { useState } from 'react';
import { AnimatedExpandableContainer } from '../components/AnimatedExpandableContainer';

const StyledButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background-color: ${({ theme }) => theme.color.blue50};
  color: ${({ theme }) => theme.font.color.primary};
  border: none;
  border-radius: ${({ theme }) => theme.spacing(1)};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  &:hover {
    background-color: ${({ theme }) => theme.color.blue40};
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
  opacityDuration: number;
  sizeDuration: number;
  useThemeAnimation: boolean;
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
        opacityDuration={args.opacityDuration}
        sizeDuration={args.sizeDuration}
        useThemeAnimation={args.useThemeAnimation}
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
    opacityDuration: {
      control: 'number',
      description: 'Duration of the opacity animation in seconds',
      defaultValue: 0.3,
    },
    sizeDuration: {
      control: 'number',
      description: 'Duration of the size animation in seconds',
      defaultValue: 0.3,
    },
    useThemeAnimation: {
      control: 'boolean',
      description: 'Whether to use theme-based animation duration',
      defaultValue: false,
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
    opacityDuration: 0.3,
    sizeDuration: 0.3,
    useThemeAnimation: false,
  },
};

export const FitContent: Story = {
  args: {
    ...Default.args,
    mode: 'fit-content',
  },
};

export const ThemeAnimation: Story = {
  args: {
    ...Default.args,
    useThemeAnimation: true,
  },
};

export const CustomDurations: Story = {
  args: {
    ...Default.args,
    opacityDuration: 0.8,
    sizeDuration: 1.2,
  },
};

export const WidthAnimation: Story = {
  args: {
    ...Default.args,
    dimension: 'width',
  },
};
