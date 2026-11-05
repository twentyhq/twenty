import { resolveViewChildEntityViewIds } from 'src/engine/metadata-modules/view/utils/resolve-view-child-entity-view-ids.util';

describe('resolveViewChildEntityViewIds', () => {
  it('reads the view named by the input', () => {
    expect(
      resolveViewChildEntityViewIds({
        args: { input: { viewId: 'view-id' } },
        body: undefined,
      }),
    ).toEqual(['view-id']);
  });

  it('falls back to the REST body', () => {
    expect(
      resolveViewChildEntityViewIds({ args: {}, body: { viewId: 'view-id' } }),
    ).toEqual(['view-id']);
  });

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
          inputs: [{ viewId: '' }, { viewId: 123 }, { viewId: 'view-valid' }],
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
