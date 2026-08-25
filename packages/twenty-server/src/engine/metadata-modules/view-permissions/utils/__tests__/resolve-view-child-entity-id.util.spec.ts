import { resolveViewChildEntityId } from 'src/engine/metadata-modules/view-permissions/utils/resolve-view-child-entity-id.util';

describe('resolveViewChildEntityId', () => {
  it('reads the top-level id a mutation is routed by', () => {
    expect(
      resolveViewChildEntityId({
        args: { id: 'entity-id' },
        params: undefined,
      }),
    ).toBe('entity-id');
  });

  it('prefers the routed id over one carried in the input', () => {
    expect(
      resolveViewChildEntityId({
        args: { id: 'routed-entity-id', input: { id: 'other-entity-id' } },
        params: undefined,
      }),
    ).toBe('routed-entity-id');
  });

  it('reads the input id when the mutation takes no top-level id', () => {
    expect(
      resolveViewChildEntityId({
        args: { input: { id: 'entity-id' } },
        params: undefined,
      }),
    ).toBe('entity-id');
  });

  it('falls back to the REST path parameter', () => {
    expect(
      resolveViewChildEntityId({ args: {}, params: { id: 'entity-id' } }),
    ).toBe('entity-id');
  });

  it('returns null when no id is named', () => {
    expect(
      resolveViewChildEntityId({ args: {}, params: undefined }),
    ).toBeNull();
  });

  it('ignores an empty string so it does not pass as a named entity', () => {
    expect(
      resolveViewChildEntityId({
        args: { id: '', input: { id: 'entity-id' } },
        params: undefined,
      }),
    ).toBe('entity-id');
  });

  it('ignores non-string ids', () => {
    expect(
      resolveViewChildEntityId({
        args: { id: 42 },
        params: { id: 'entity-id' },
      }),
    ).toBe('entity-id');
  });
});
