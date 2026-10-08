import { FieldMetadataType } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { resolveWorkspaceMemberPredicateValue } from 'src/engine/twenty-orm/utils/resolve-workspace-member-predicate-value.util';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const REGION_ID = '20202020-0000-4000-8000-000000000001';

const buildFieldMetadata = (
  fieldMetadata: Partial<OrmFlatFieldMetadata>,
): OrmFlatFieldMetadata =>
  ({
    id: 'field-id',
    name: 'region',
    ...fieldMetadata,
  }) as OrmFlatFieldMetadata;

const buildWorkspaceMember = (properties: Record<string, unknown>) =>
  properties as unknown as WorkspaceMemberWorkspaceEntity;

describe('resolveWorkspaceMemberPredicateValue', () => {
  it('should read a many-to-one relation from its join column', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({ regionId: REGION_ID }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.MANY_TO_ONE },
      }),
      workspaceMemberSubFieldName: null,
    });

    expect(result).toBe(REGION_ID);
  });

  it('should return null when the relation is not set on the workspace member', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({ regionId: null }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.MANY_TO_ONE },
      }),
      workspaceMemberSubFieldName: null,
    });

    expect(result).toBeNull();
  });

  it('should return null for a one-to-many relation, which has no join column', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({ regions: [{ id: REGION_ID }] }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        name: 'regions',
        type: FieldMetadataType.RELATION,
        settings: { relationType: RelationType.ONE_TO_MANY },
      }),
      workspaceMemberSubFieldName: null,
    });

    expect(result).toBeNull();
  });

  it('should read a subfield of a composite field', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({
        name: { firstName: 'Jony', lastName: 'Ive' },
      }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      }),
      workspaceMemberSubFieldName: 'firstName',
    });

    expect(result).toBe('Jony');
  });

  it('should return null when the composite subfield is empty', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({
        name: { firstName: null, lastName: 'Ive' },
      }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        name: 'name',
        type: FieldMetadataType.FULL_NAME,
      }),
      workspaceMemberSubFieldName: 'firstName',
    });

    expect(result).toBeNull();
  });

  it('should wrap a select value in an array to match the multi-select filter format', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({ area: 'EMEA' }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        name: 'area',
        type: FieldMetadataType.SELECT,
      }),
      workspaceMemberSubFieldName: null,
    });

    expect(result).toEqual(['EMEA']);
  });

  it('should return a scalar value as is', () => {
    const result = resolveWorkspaceMemberPredicateValue({
      workspaceMember: buildWorkspaceMember({ jobTitle: 'Designer' }),
      workspaceMemberFieldMetadata: buildFieldMetadata({
        name: 'jobTitle',
        type: FieldMetadataType.TEXT,
      }),
      workspaceMemberSubFieldName: null,
    });

    expect(result).toBe('Designer');
  });
});
