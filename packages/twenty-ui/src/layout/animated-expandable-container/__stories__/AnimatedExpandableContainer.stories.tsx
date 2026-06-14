import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { clsx } from 'clsx';
import { useState } from 'react';
import { AnimatedExpandableContainer } from '../components/AnimatedExpandableContainer';

import styles from './AnimatedExpandableContainer.stories.module.scss';

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
    <div
      className={clsx(
        styles.buttonWrapper,
        args.dimension === 'width'
          ? styles.buttonWrapperWidth
          : styles.buttonWrapperHeight,
      )}
    >
      <button
        className={styles.button}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </button>
      <AnimatedExpandableContainer
        isExpanded={isExpanded}
        dimension={args.dimension}
        mode={args.mode}
        animationDurations={args.animationDurations}
      >
        <div className={styles.expandableWrapper}>
          <div
            className={clsx(
              styles.content,
              args.dimension === 'height' &&
                args.mode === 'scroll-height' &&
                styles.contentFixedHeight,
              args.dimension === 'width' && styles.contentFixedWidth,
            )}
          >
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
          </div>
        </div>
      </AnimatedExpandableContainer>
    </div>
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
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    isExpanded: false,
    dimension: 'height',
    mode: 'scroll-height',
    animationDurations: 'default',
  },
};

export const FitContent: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    ...Default.args,
    mode: 'fit-content',
  },
};

export const CustomDurations: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    ...Default.args,
    animationDurations: { opacity: 0.8, size: 1.2 },
  },
};

export const WidthAnimation: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    ...Default.args,
    dimension: 'width',
  },
};
