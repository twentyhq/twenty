import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';
import { useMediaQuery } from 'react-responsive';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn(),
}));

describe('useIsMobile', () => {
  it('should keep a stable media query configuration between renders', () => {
    const mockedUseMediaQuery = jest.mocked(useMediaQuery);
    mockedUseMediaQuery.mockReturnValue(false);

    const { rerender, result } = renderHook(() => useIsMobile());

    rerender();

    expect(result.current).toBe(false);
    expect(mockedUseMediaQuery).toHaveBeenCalledTimes(2);
    expect(mockedUseMediaQuery.mock.calls[0][0]).toBe(
      mockedUseMediaQuery.mock.calls[1][0],
    );
  });
});
