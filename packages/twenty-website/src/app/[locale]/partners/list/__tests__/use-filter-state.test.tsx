import { renderToStaticMarkup } from 'react-dom/server';

import { useFilterState } from '../use-filter-state';

let mockSearchParams = new URLSearchParams();
const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/en/partners/list',
}));

type FilterStateResult = ReturnType<typeof useFilterState>;

function Capture({ onCapture }: { onCapture: (s: FilterStateResult) => void }) {
  const state = useFilterState();
  onCapture(state);
  return null;
}

const getState = (): FilterStateResult => {
  let captured!: FilterStateResult;
  renderToStaticMarkup(
    <Capture
      onCapture={(s) => {
        captured = s;
      }}
    />,
  );
  return captured;
};

describe('useFilterState', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    mockReplace.mockReset();
  });

  it('returns empty criteria and hasAnyFilter=false for empty params', () => {
    const state = getState();
    expect(state.hasAnyFilter).toBe(false);
    expect(state.criteria.regions.size).toBe(0);
    expect(state.criteria.languages.size).toBe(0);
    expect(state.criteria.deployments.size).toBe(0);
  });

  it('parses regions=EUROPE,US into Set {EUROPE, US}', () => {
    mockSearchParams = new URLSearchParams('regions=EUROPE,US');
    const state = getState();
    expect(state.criteria.regions).toEqual(new Set(['EUROPE', 'US']));
    expect(state.hasAnyFilter).toBe(true);
  });

  it('silently drops unknown values', () => {
    mockSearchParams = new URLSearchParams('regions=EUROPE,MARS');
    const state = getState();
    expect(state.criteria.regions).toEqual(new Set(['EUROPE']));
  });

  it('toggleRegion adds a value to the URL when absent', () => {
    const state = getState();
    state.toggleRegion('EUROPE');
    expect(mockReplace).toHaveBeenCalledTimes(1);
    const [url, options] = mockReplace.mock.calls[0] as [string, unknown];
    expect(url).toContain('regions=EUROPE');
    expect(options).toEqual({ scroll: false });
  });

  it('toggleRegion removes a value from the URL when present', () => {
    mockSearchParams = new URLSearchParams('regions=EUROPE,US');
    const state = getState();
    state.toggleRegion('EUROPE');
    const [url] = mockReplace.mock.calls[0] as [string, unknown];
    expect(url).toContain('US');
    expect(url).not.toMatch(/EUROPE/);
  });

  it('clearAll navigates to the bare pathname with no query string', () => {
    mockSearchParams = new URLSearchParams('regions=EUROPE&languages=FRENCH');
    const state = getState();
    state.clearAll();
    expect(mockReplace).toHaveBeenCalledWith('/en/partners/list', {
      scroll: false,
    });
  });

  it('hasAnyFilter is true when languages facet has values', () => {
    mockSearchParams = new URLSearchParams('languages=FRENCH');
    const state = getState();
    expect(state.hasAnyFilter).toBe(true);
  });
});
