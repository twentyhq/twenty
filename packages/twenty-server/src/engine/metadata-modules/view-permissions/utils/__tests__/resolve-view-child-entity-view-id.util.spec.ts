import {
  resolveViewChildEntityViewId,
  resolveViewChildEntityViewIds,
} from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-view-id.util';

describe('resolveViewChildEntityViewId', () => {
  it('reads the view named by the input', () => {
    expect(
      resolveViewChildEntityViewId({
        args: { input: { viewId: 'view-id' } },
        body: undefined,
      }),
    ).toBe('view-id');
  });

  it('reads the view named by the first of a bulk create', () => {
    expect(
      resolveViewChildEntityViewId({
        args: { inputs: [{ viewId: 'view-id' }] },
        body: undefined,
      }),
    ).toBe('view-id');
  });

  it('falls back to the REST body', () => {
    expect(
      resolveViewChildEntityViewId({ args: {}, body: { viewId: 'view-id' } }),
    ).toBe('view-id');
  });

  it('returns null when no view is named', () => {
    expect(
      resolveViewChildEntityViewId({ args: {}, body: undefined }),
    ).toBeNull();
  });

  it('does not accept an empty string as a named view', () => {
    expect(
      resolveViewChildEntityViewId({
        args: { input: { viewId: '' } },
        body: undefined,
      }),
    ).toBeNull();
  });
});

describe('resolveViewChildEntityViewIds', () => {
  it('resolves all distinct views across bulk create inputs', () => {
    expect(
      resolveViewChildEntityViewIds({
        args: {
          inputs: [
            { viewId: 'view-1' },
            { viewId: 'view-2' },
            { viewId: 'view-1' },
          ],
        },
        body: undefined,
      }),
    ).toEqual(['view-1', 'view-2']);
  });

  it('ignores empty strings and non-string values', () => {
    expect(
      resolveViewChildEntityViewIds({
        args: {
          inputs: [
            { viewId: '' },
            { viewId: 123 as any },
            { viewId: 'view-valid' },
          ],
        },
        body: undefined,
      }),
    ).toEqual(['view-valid']);
  });

  it('returns empty array when neither input nor body names a view', () => {
    expect(
      resolveViewChildEntityViewIds({
        args: undefined,
        body: undefined,
      }),
    ).toEqual([]);
  });
});
