import { type Meta, type StoryObj } from '@storybook/react-vite';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { clsx } from 'clsx';
import { useState } from 'react';
import { Collapsible } from '@ui/primitives/layout/Collapsible/Collapsible';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import styles from './Collapsible.stories.module.scss';

type CollapsibleWithButtonProps = {
  isExpanded: boolean;
  dimension: 'width' | 'height';
  hasFixedHeight: boolean;
  animationDurations:
    | {
        opacity: number;
        size: number;
      }
    | 'default';
};

const CollapsibleWithButton = ({
  isExpanded: initialIsExpanded,
  ...args
}: CollapsibleWithButtonProps) => {
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
      <Button
        type="button"
        className={styles.button}
        aria-label={isExpanded ? 'Collapse' : 'Expand'}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Collapse' : 'Expand'}
      </Button>
      <Collapsible
        isExpanded={isExpanded}
        dimension={args.dimension}
        animationDurations={args.animationDurations}
      >
        <div className={styles.expandableWrapper}>
          <div
            className={clsx(
              styles.content,
              args.dimension === 'height' &&
                args.hasFixedHeight &&
                styles.contentFixedHeight,
              args.dimension === 'width' && styles.contentFixedWidth,
            )}
          >
            <Text render={<p />}>
              This is some content inside the Collapsible. It will animate
              smoothly when expanding or collapsing.
            </Text>
            <Text render={<p />}>
              You can control the animation duration, dimension, and content
              height through the Storybook controls.
            </Text>
            <Text render={<p />}>
              Try different combinations to see how the container behaves with
              different settings!
            </Text>
          </div>
        </div>
      </Collapsible>
    </div>
  );
};

const meta: Meta<typeof CollapsibleWithButton> = {
  id: 'ui-layout-animatedexpandablecontainer',
  title: 'UI/Layout/Collapsible',
  component: CollapsibleWithButton,
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
    hasFixedHeight: {
      control: 'boolean',
      description: 'Use content with a fixed height in this example',
      defaultValue: true,
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
type Story = StoryObj<typeof CollapsibleWithButton>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    isExpanded: false,
    dimension: 'height',
    hasFixedHeight: true,
    animationDurations: 'default',
  },
};

export const FitContent: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...Default.args,
    hasFixedHeight: false,
  },
};

export const CustomDurations: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...Default.args,
    animationDurations: { opacity: 0.8, size: 1.2 },
  },
};

export const WidthAnimation: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...Default.args,
    dimension: 'width',
  },
};
