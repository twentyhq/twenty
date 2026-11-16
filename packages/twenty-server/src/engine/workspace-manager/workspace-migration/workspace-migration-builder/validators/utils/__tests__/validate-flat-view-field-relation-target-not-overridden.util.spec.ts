import { AggregateOperations } from 'twenty-shared/types';

import { validateFlatViewFieldRelationTargetNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-target-not-overridden.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const OTHER_APPLICATION = 'other-application';

const validate = ({
  ownerApplication,
  callerApplication,
  relationTargetFieldMetadataUniversalIdentifier,
  relationAggregateOperation = null,
}: {
  ownerApplication: string;
  callerApplication: string;
  relationTargetFieldMetadataUniversalIdentifier: string | null;
  relationAggregateOperation?: AggregateOperations | null;
}) =>
  validateFlatViewFieldRelationTargetNotOverridden({
    existingFlatViewField: {
      applicationUniversalIdentifier: ownerApplication,
      isSystemSideEffect: false,
      relationTargetFieldMetadataUniversalIdentifier: 'name-field',
      relationAggregateOperation: null,
    },
    updatedFlatViewField: {
      relationTargetFieldMetadataUniversalIdentifier,
      relationAggregateOperation,
    },
    buildOptions: {
      applicationUniversalIdentifier: callerApplication,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

describe('validateFlatViewFieldRelationTargetNotOverridden', () => {
  it('rejects a workspace change to the target of an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: 'address-field',
      }),
    ).toHaveLength(1);
  });

  it('rejects clearing the target of an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: null,
      }),
    ).toHaveLength(1);
  });

  it('rejects a workspace change to the aggregate operation of an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: 'name-field',
        relationAggregateOperation: AggregateOperations.MAX,
      }),
    ).toHaveLength(1);
  });

  it('lets the owning application change the target', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: OTHER_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: 'address-field',
      }),
    ).toEqual([]);
  });

  it('lets the workspace change the target of its own column', () => {
    expect(
      validate({
        ownerApplication: WORKSPACE_CUSTOM_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: 'address-field',
      }),
    ).toEqual([]);
  });

  it('accepts other changes to an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationTargetFieldMetadataUniversalIdentifier: 'name-field',
      }),
    ).toEqual([]);
  });
});
