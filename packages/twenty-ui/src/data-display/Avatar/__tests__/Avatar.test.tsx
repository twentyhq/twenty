import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { ThemeProvider } from '@ui/theme-constants';

type RenderAvatarArgs = {
  placeholder: string | undefined;
  onClick?: () => void;
};

const renderAvatar = ({ placeholder, onClick }: RenderAvatarArgs) =>
  render(
    <ThemeProvider colorScheme="light">
      <Avatar placeholder={placeholder} onClick={onClick} />
    </ThemeProvider>,
  );

describe('Avatar', () => {
  it('should not expose a button role when it is not clickable', () => {
    renderAvatar({ placeholder: 'Alice' });

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should be a focusable button labelled by the placeholder when clickable', () => {
    renderAvatar({ placeholder: 'Alice', onClick: jest.fn() });

    const avatar = screen.getByRole('button', { name: 'Alice' });

    expect(avatar).toHaveAttribute('tabindex', '0');
  });

  it('should fall back to a generic label when clickable without a placeholder', () => {
    renderAvatar({ placeholder: undefined, onClick: jest.fn() });

    expect(screen.getByRole('button', { name: 'Avatar' })).toBeInTheDocument();
  });

  it('should call onClick when activated with the enter key', async () => {
    const onClick = jest.fn();
    renderAvatar({ placeholder: 'Alice', onClick });

    await userEvent.tab();
    await userEvent.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when activated with the space key', async () => {
    const onClick = jest.fn();
    renderAvatar({ placeholder: 'Alice', onClick });

    await userEvent.tab();
    await userEvent.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
