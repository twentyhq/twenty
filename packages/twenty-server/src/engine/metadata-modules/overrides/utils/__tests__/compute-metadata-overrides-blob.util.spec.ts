import { computeMetadataOverridesBlob } from 'src/engine/metadata-modules/overrides/utils/compute-metadata-overrides-blob.util';

const CUSTOM = '20202020-aaaa-4aaa-8aaa-000000000001';
const OWNER = '20202020-bbbb-4bbb-8bbb-000000000002';

const authorContext = {
  workspaceCustomApplicationUniversalIdentifier: CUSTOM,
  ownerApplicationUniversalIdentifier: OWNER,
};

const existingEntity = {
  applicationUniversalIdentifier: OWNER,
  label: 'Company',
  icon: 'IconBuilding',
  isActive: true,
  position: 0,
};

const compute = ({
  updatedProperties,
  existingOverrides = null,
  authorUniversalIdentifier = CUSTOM,
}: {
  updatedProperties: Record<string, unknown>;
  existingOverrides?: unknown;
  authorUniversalIdentifier?: string;
}) =>
  computeMetadataOverridesBlob({
    overridableProperties: ['label', 'icon', 'isActive'],
    updatedProperties,
    existingEntity,
    existingOverrides,
    authorUniversalIdentifier,
    authorContext,
  });

describe('computeMetadataOverridesBlob', () => {
  it('moves overridable properties into the author entry and leaves the rest', () => {
    expect(
      compute({ updatedProperties: { label: 'Société', position: 3 } }),
    ).toEqual({
      overrides: { [CUSTOM]: { label: 'Société' } },
      remainingProperties: { position: 3 },
    });
  });

  it('merges into the existing author entry and keeps other authors', () => {
    expect(
      compute({
        updatedProperties: { icon: 'IconStar' },
        existingOverrides: {
          [CUSTOM]: { label: 'Société' },
          [OWNER]: { icon: 'IconHome' },
        },
      }),
    ).toEqual({
      overrides: {
        [OWNER]: { icon: 'IconHome' },
        [CUSTOM]: { label: 'Société', icon: 'IconStar' },
      },
      remainingProperties: {},
    });
  });

  it('treats a value equal to the column as a revert', () => {
    expect(
      compute({
        updatedProperties: { label: 'Company' },
        existingOverrides: { [CUSTOM]: { label: 'Société', icon: 'IconStar' } },
      }).overrides,
    ).toEqual({ [CUSTOM]: { icon: 'IconStar' } });
  });

  it('compares the revert against the entry beneath, not the column', () => {
    const existingOverrides = { [OWNER]: { label: 'Account' } };

    expect(
      compute({ updatedProperties: { label: 'Account' }, existingOverrides })
        .overrides,
    ).toEqual(existingOverrides);
    expect(
      compute({ updatedProperties: { label: 'Company' }, existingOverrides })
        .overrides,
    ).toEqual({ ...existingOverrides, [CUSTOM]: { label: 'Company' } });
  });

  it('stores an explicit null as a value', () => {
    expect(compute({ updatedProperties: { icon: null } }).overrides).toEqual({
      [CUSTOM]: { icon: null },
    });
  });

  it('collapses an emptied entry and an emptied map to null', () => {
    expect(
      compute({
        updatedProperties: { label: 'Company' },
        existingOverrides: { [CUSTOM]: { label: 'Société' } },
      }).overrides,
    ).toBeNull();
  });

  it('ignores an undefined update and keeps the entry', () => {
    expect(
      compute({
        updatedProperties: { label: undefined },
        existingOverrides: { [CUSTOM]: { label: 'Société' } },
      }),
    ).toEqual({
      overrides: { [CUSTOM]: { label: 'Société' } },
      remainingProperties: { label: undefined },
    });
  });

  it('lifts a legacy non-authored override under the custom key first', () => {
    expect(
      compute({
        updatedProperties: { icon: 'IconStar' },
        existingOverrides: { label: 'Société' },
      }).overrides,
    ).toEqual({ [CUSTOM]: { label: 'Société', icon: 'IconStar' } });
  });

  it('falls back to the column when the author is outside the order', () => {
    const OTHER = '20202020-cccc-4ccc-8ccc-000000000003';

    expect(
      compute({
        updatedProperties: { label: 'Company' },
        existingOverrides: { [OWNER]: { label: 'Account' } },
        authorUniversalIdentifier: OTHER,
      }).overrides,
    ).toEqual({ [OWNER]: { label: 'Account' } });
  });
});
