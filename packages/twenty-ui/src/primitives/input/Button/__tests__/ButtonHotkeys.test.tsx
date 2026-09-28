import { act, within } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { vi } from 'vitest';

import { Button } from '../Button';

const MAC_USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

describe('Button hotkeys', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('should hydrate server-rendered hotkeys on Mac before removing the separator', async () => {
    const saveButton = <Button hotkeys={['Ctrl', 'S']}>Save</Button>;
    vi.stubGlobal('navigator', undefined);
    const serverMarkup = renderToString(saveButton);
    vi.unstubAllGlobals();
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(
      MAC_USER_AGENT,
    );
    const container = document.createElement('div');
    container.innerHTML = serverMarkup;
    document.body.appendChild(container);

    expect(within(container).getByText('Ctrl S')).toBeInTheDocument();

    const onRecoverableError = vi.fn();
    const root = await act(() =>
      hydrateRoot(container, saveButton, { onRecoverableError }),
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(within(container).getByText('CtrlS')).toBeInTheDocument();
    await act(() => root.unmount());
  });
});
