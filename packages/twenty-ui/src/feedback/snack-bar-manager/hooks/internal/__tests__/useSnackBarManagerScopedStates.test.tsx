import React from 'react';
import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { SnackBarProviderScope } from 'src/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { SnackBarState } from 'src/feedback/snack-bar-manager/states/snackBarInternalScopedState';

import { useSnackBarManagerScopedStates } from '../useSnackBarManagerScopedStates';

const snackBarManagerScopeId = 'snack-bar-manager';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RecoilRoot>
      <SnackBarProviderScope snackBarManagerScopeId={snackBarManagerScopeId}>
        {children}
      </SnackBarProviderScope>
    </RecoilRoot>
  );
};

describe('useSnackBarManagerScopedStates', () => {
  it('should return snackbar state and a function to update the state', async () => {
    const { result } = renderHook(
      () =>
        useSnackBarManagerScopedStates({
          snackBarManagerScopeId,
        }),
      { wrapper: Wrapper },
    );

    const defaultState = { maxQueue: 3, queue: [] };

    expect(result.current.snackBarInternal).toEqual(defaultState);

    const newSnackBarState: SnackBarState = {
      maxQueue: 5,
      queue: [{ id: 'testid', role: 'alert', message: 'TEST MESSAGE' }],
    };

    act(() => {
      result.current.setSnackBarInternal(newSnackBarState);
    });

    expect(result.current.snackBarInternal).toEqual(newSnackBarState);
  });
});
