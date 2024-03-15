import { renderHook } from '@testing-library/react';

import { useScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useScopeInternalContext';
import { createScopeInternalContext } from '@/ui/utilities/recoil-scope/scopes-internal/utils/createScopeInternalContext';

const scopeId = 'scopeId';
const MockedContext = createScopeInternalContext();

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedContext.Provider value={{ scopeId }}>
    {children}
  </MockedContext.Provider>
);

describe('useScopeInternalContext', () => {
  it('should work as expected', () => {
    const {
      result: {
        current: { scopeInternalContext },
      },
    } = renderHook(
      () => ({
        scopeInternalContext: useScopeInternalContext(MockedContext),
      }),
      {
        wrapper: Wrapper,
      },
    );

    expect(scopeInternalContext!.scopeId).toBe(scopeId);
  });
});
