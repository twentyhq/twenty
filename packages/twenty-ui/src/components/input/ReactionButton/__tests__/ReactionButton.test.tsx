import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';

import { ReactionButton } from '../ReactionButton';
import styles from '../ReactionButton.module.scss';

runComponentConformance({
  name: 'ReactionButton',
  element: (
    <ReactionButton
      aria-label="Helpful"
      emoji="👍"
      count={2}
      pressed={false}
      onPressedChange={vi.fn()}
    />
  ),
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
  skip: ['renderProp'],
});

describe('ReactionButton native contract', () => {
  it('keeps its compact button appearance inside a differently styled group', () => {
    render(
      <ButtonGroup variant="solid" color="danger" size="md">
        <ReactionButton
          aria-label="Helpful"
          emoji="👍"
          count={0}
          pressed={false}
          onPressedChange={vi.fn()}
        />
      </ButtonGroup>,
    );

    const reaction = screen.getByRole('button', { name: 'Helpful' });

    expect(reaction).toHaveAttribute('type', 'button');
    expect(reaction).toHaveAttribute('data-variant', 'ghost');
    expect(reaction).toHaveAttribute('data-color', 'neutral');
    expect(reaction).toHaveAttribute('data-size', 'sm');
    expect(reaction).toHaveAttribute('aria-pressed', 'false');
    expect(reaction).toHaveTextContent('0');
  });

  it('accepts external accessible names and caller-formatted counts', () => {
    render(
      <>
        <span id="reaction-label">Helpful</span>
        <ReactionButton
          aria-labelledby="reaction-label"
          emoji="👍"
          count="1,234"
          pressed
          onPressedChange={vi.fn()}
        />
      </>,
    );

    const reaction = screen.getByRole('button', { name: 'Helpful' });

    expect(reaction).toHaveAttribute('aria-pressed', 'true');
    expect(reaction).toHaveTextContent('1,234');
  });
});
