import { AggregateOperations } from 'twenty-shared/types';

import { validateFlatViewFieldRelationAggregateNotOverridden } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/validate-flat-view-field-relation-aggregate-not-overridden.util';

const WORKSPACE_CUSTOM_APPLICATION = 'workspace-custom-application';
const OTHER_APPLICATION = 'other-application';

const validate = ({
  ownerApplication,
  callerApplication,
  relationAggregateOperation,
}: {
  ownerApplication: string;
  callerApplication: string;
  relationAggregateOperation: AggregateOperations | null;
}) =>
  validateFlatViewFieldRelationAggregateNotOverridden({
    existingFlatViewField: {
      applicationUniversalIdentifier: ownerApplication,
      isSystemSideEffect: false,
      relationAggregateOperation: AggregateOperations.COUNT,
    },
    updatedFlatViewField: { relationAggregateOperation },
    buildOptions: {
      applicationUniversalIdentifier: callerApplication,
      workspaceCustomApplicationUniversalIdentifier:
        WORKSPACE_CUSTOM_APPLICATION,
    },
  });

describe('validateFlatViewFieldRelationAggregateNotOverridden', () => {
  it('rejects a workspace change to the aggregate of an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationAggregateOperation: AggregateOperations.SUM,
      }),
    ).toHaveLength(1);
  });

  it('rejects clearing the aggregate of an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationAggregateOperation: null,
      }),
    ).toHaveLength(1);
  });

  it('lets the owning application change the aggregate', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: OTHER_APPLICATION,
        relationAggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual([]);
  });

  it('lets the workspace change the aggregate of its own column', () => {
    expect(
      validate({
        ownerApplication: WORKSPACE_CUSTOM_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationAggregateOperation: AggregateOperations.SUM,
      }),
    ).toEqual([]);
  });

  it('accepts other changes to an application-owned column', () => {
    expect(
      validate({
        ownerApplication: OTHER_APPLICATION,
        callerApplication: WORKSPACE_CUSTOM_APPLICATION,
        relationAggregateOperation: AggregateOperations.COUNT,
      }),
    ).toEqual([]);
  });
});
