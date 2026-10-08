import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { CommandBlock } from '../CommandBlock';
import styles from '../CommandBlock.module.scss';

runComponentConformance({
  name: 'CommandBlock',
  element: <CommandBlock commands={['yarn add twenty-ui']} />,
  ownClassName: styles.container,
  refInstanceOf: HTMLDivElement,
  renderPropTagName: 'section',
});

describe('CommandBlock', () => {
  it('displays literal command text with code semantics and preserved line breaks', () => {
    render(<CommandBlock commands={['echo "<hello>"', 'yarn start']} />);
    const code = screen.getByRole('code');
    expect(code.parentElement?.tagName).toBe('PRE');
    expect(code.textContent).toBe('> echo "<hello>"\n> yarn start');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('composes action content and both root and render handlers', async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onRenderFocus = vi.fn();
    const onAction = vi.fn();
    render(
      <CommandBlock
        commands={['yarn start']}
        onFocus={onFocus}
        render={
          <section aria-label="Start application" onFocus={onRenderFocus} />
        }
        actions={
          <>
            <a href="#documentation">Read instructions</a>
            <button onClick={onAction}>Copy</button>
            <span>Ready</span>
          </>
        }
      />,
    );
    expect(
      screen.getByRole('region', { name: 'Start application' }),
    ).toHaveTextContent('Ready');
    await user.tab();
    expect(
      screen.getByRole('link', { name: 'Read instructions' }),
    ).toHaveFocus();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onFocus).toHaveBeenCalledTimes(2);
    expect(onRenderFocus).toHaveBeenCalledTimes(2);
  });
});
