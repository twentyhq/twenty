import { resolveViewChildEntityViewId } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-view-id.util';

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
