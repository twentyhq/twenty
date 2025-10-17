import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { findOneCoreView } from 'test/integration/metadata/suites/view/utils/find-one-core-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';

const VIEW_WITH_KANBAN_FIELDS = `
  id
  name
  objectMetadataId
  type
  icon
  position
  isCompact
  kanbanAggregateOperation
  kanbanAggregateOperationFieldMetadataId
`;

type TestSetup = {
  objectMetadataId: string;
  aggregateFieldMetadataId: string;
  nonAggregateFieldMetadataId: string;
  viewWithAggregateId: string;
  viewWithoutAggregateId: string;
};

type TestContext = {
  input: (testSetup: TestSetup) => {
    fieldIdToDeactivate: string;
  };
  expected: {
    viewWithAggregateShouldBeDeleted: boolean;
    viewWithoutAggregateShouldExist: boolean;
  };
};

describe('update-one-field-metadata-view-deletion-on-deactivation-v2', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    // Create object
    const {
      data: {
        createOneObject: { id: objectMetadataId },
      },
    } = await createOneObjectMetadata({
      expectToFail: false,
      input: {
        nameSingular: 'viewDeletionTestObject',
        namePlural: 'viewDeletionTestObjects',
        labelSingular: 'View Deletion Test Object',
        labelPlural: 'View Deletion Test Objects',
        icon: 'IconTestTube',
      },
    });

    const {
      data: {
        createOneField: { id: aggregateFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'aggregateField',
        type: FieldMetadataType.NUMBER,
        label: 'Aggregate Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

    const {
      data: {
        createOneField: { id: nonAggregateFieldMetadataId },
      },
    } = await createOneFieldMetadata({
      expectToFail: false,
      input: {
        name: 'normalField',
        type: FieldMetadataType.TEXT,
        label: 'Normal Field',
        objectMetadataId,
      },
      gqlFields: 'id',
    });

      const {
        data: {
          createCoreView: viewWithAggregate,
        },
      } = await createOneCoreView({
        input: {
          name: generateRecordName('Kanban View With Aggregate'),
          objectMetadataId,
          type: ViewType.KANBAN,
          kanbanAggregateOperationFieldMetadataId: aggregateFieldMetadataId,
          kanbanAggregateOperation: AggregateOperations.SUM,
          icon: 'IconLayoutKanban',
        },
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      const {
        data: {
          createCoreView: viewWithoutAggregate,
        },
      } = await createOneCoreView({
        input: {
          name: generateRecordName('Kanban View Without Aggregate'),
          objectMetadataId,
          type: ViewType.KANBAN,
          icon: 'IconLayoutKanban',
        },
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

    testSetup = {
      objectMetadataId,
      aggregateFieldMetadataId,
      nonAggregateFieldMetadataId,
      viewWithAggregateId: viewWithAggregate.id,
      viewWithoutAggregateId: viewWithoutAggregate.id,
    };
  });

  afterEach(async () => {
    await updateOneObjectMetadata({
      expectToFail: false,
      input: {
        idToUpdate: testSetup.objectMetadataId,
        updatePayload: {
          isActive: false,
        },
      },
    });
    await deleteOneObjectMetadata({
      expectToFail: false,
      input: { idToDelete: testSetup.objectMetadataId },
    });
  });

  const testCases: EachTestingContext<TestContext>[] = [
    {
      title:
        'should delete view when field used as kanbanAggregateOperationFieldMetadataId is deactivated',
      context: {
        input: (testSetup) => ({
          fieldIdToDeactivate: testSetup.aggregateFieldMetadataId,
        }),
        expected: {
          viewWithAggregateShouldBeDeleted: true,
          viewWithoutAggregateShouldExist: true,
        },
      },
    },
    {
      title:
        'should not delete view when field not used as kanbanAggregateOperationFieldMetadataId is deactivated',
      context: {
        input: (testSetup) => ({
          fieldIdToDeactivate: testSetup.nonAggregateFieldMetadataId,
        }),
        expected: {
          viewWithAggregateShouldBeDeleted: false,
          viewWithoutAggregateShouldExist: true,
        },
      },
    },
  ];

  test.each(eachTestingContextFilter(testCases))('$title', async ({ context }) => {
    const { input, expected } = context;
    const { fieldIdToDeactivate } = input(testSetup);

      const {
        data: { getCoreView: initialViewWithAggregate },
        errors: viewWithAggregateErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });
      const {
        data: { getCoreView: initialViewWithoutAggregate },
        errors: viewWithoutAggregateErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithoutAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      expect(viewWithAggregateErrors).toBeUndefined();
      expect(viewWithoutAggregateErrors).toBeUndefined();
      expect(isDefined(initialViewWithAggregate)).toBe(true);
      expect(isDefined(initialViewWithoutAggregate)).toBe(true);

      if (
        fieldIdToDeactivate === testSetup.aggregateFieldMetadataId &&
        initialViewWithAggregate
      ) {
        expect(
          initialViewWithAggregate.kanbanAggregateOperationFieldMetadataId,
        ).toBe(testSetup.aggregateFieldMetadataId);
        expect(initialViewWithAggregate.kanbanAggregateOperation).toBe('SUM');
      }

    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldIdToDeactivate,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldIdToDeactivate);
    expect(data.updateOneField.isActive).toBe(false);

      const {
        data: { getCoreView: viewWithAggregateAfterDeactivation },
        errors: viewWithAggregateAfterErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: expected.viewWithAggregateShouldBeDeleted,
      });

      if (expected.viewWithAggregateShouldBeDeleted) {
        expect(viewWithAggregateAfterErrors).toBeDefined();
        expect(viewWithAggregateAfterDeactivation).toBeNull();
      } else {
        expect(viewWithAggregateAfterErrors).toBeUndefined();
        expect(isDefined(viewWithAggregateAfterDeactivation)).toBe(true);
      }

      const {
        data: { getCoreView: viewWithoutAggregateAfterDeactivation },
        errors: viewWithoutAggregateAfterErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithoutAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: !expected.viewWithoutAggregateShouldExist,
      });

      if (expected.viewWithoutAggregateShouldExist) {
        expect(viewWithoutAggregateAfterErrors).toBeUndefined();
        expect(isDefined(viewWithoutAggregateAfterDeactivation)).toBe(true);
      } else {
        expect(viewWithoutAggregateAfterErrors).toBeDefined();
        expect(viewWithoutAggregateAfterDeactivation).toBeNull();
      }
  });

  it('should delete multiple views when they all use the same field as kanbanAggregateOperationFieldMetadataId', async () => {
      const {
        data: {
          createCoreView: secondViewWithAggregate,
        },
      } = await createOneCoreView({
        input: {
          name: generateRecordName('Second Kanban View With Aggregate'),
          objectMetadataId: testSetup.objectMetadataId,
          type: ViewType.KANBAN,
          kanbanAggregateOperationFieldMetadataId:
            testSetup.aggregateFieldMetadataId,
          kanbanAggregateOperation: AggregateOperations.MAX,
          icon: 'IconLayoutKanban',
        },
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      const {
        data: { getCoreView: initialFirstView },
      } = await findOneCoreView({
        viewId: testSetup.viewWithAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });
      const {
        data: { getCoreView: initialSecondView },
      } = await findOneCoreView({
        viewId: secondViewWithAggregate.id,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      expect(isDefined(initialFirstView)).toBe(true);
      expect(isDefined(initialSecondView)).toBe(true);

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: testSetup.aggregateFieldMetadataId,
          updatePayload: { isActive: false },
        },
        gqlFields: `
        id
        isActive
      `,
      });

      const {
        data: { getCoreView: firstViewAfterDeactivation },
        errors: firstViewErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: true,
      });
      const {
        data: { getCoreView: secondViewAfterDeactivation },
        errors: secondViewErrors,
      } = await findOneCoreView({
        viewId: secondViewWithAggregate.id,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: true,
      });

      expect(firstViewErrors).toBeDefined();
      expect(firstViewAfterDeactivation).toBeNull();
      expect(secondViewErrors).toBeDefined();
      expect(secondViewAfterDeactivation).toBeNull();

      const {
        data: { getCoreView: viewWithoutAggregateAfterDeactivation },
        errors: viewWithoutAggregateErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithoutAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      expect(viewWithoutAggregateErrors).toBeUndefined();
      expect(isDefined(viewWithoutAggregateAfterDeactivation)).toBe(true);
  });

  it('should handle deactivation when view has different aggregate operations on same field', async () => {
      const {
        data: {
          createCoreView: viewWithMin,
        },
      } = await createOneCoreView({
        input: {
          name: generateRecordName('Kanban View With MIN'),
          objectMetadataId: testSetup.objectMetadataId,
          type: ViewType.KANBAN,
          kanbanAggregateOperationFieldMetadataId:
            testSetup.aggregateFieldMetadataId,
          kanbanAggregateOperation: AggregateOperations.MIN,
          icon: 'IconLayoutKanban',
        },
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      const {
        data: {
          createCoreView: viewWithAvg,
        },
      } = await createOneCoreView({
        input: {
          name: generateRecordName('Kanban View With AVG'),
          objectMetadataId: testSetup.objectMetadataId,
          type: ViewType.KANBAN,
          kanbanAggregateOperationFieldMetadataId:
            testSetup.aggregateFieldMetadataId,
          kanbanAggregateOperation: AggregateOperations.AVG,
          icon: 'IconLayoutKanban',
        },
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      await updateOneFieldMetadata({
        expectToFail: false,
        input: {
          idToUpdate: testSetup.aggregateFieldMetadataId,
          updatePayload: { isActive: false },
        },
        gqlFields: `
        id
        isActive
      `,
      });

      const {
        data: { getCoreView: viewWithSumAfter },
        errors: viewWithSumErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: true,
      });
      const {
        data: { getCoreView: viewWithMinAfter },
        errors: viewWithMinErrors,
      } = await findOneCoreView({
        viewId: viewWithMin.id,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: true,
      });
      const {
        data: { getCoreView: viewWithAvgAfter },
        errors: viewWithAvgErrors,
      } = await findOneCoreView({
        viewId: viewWithAvg.id,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: true,
      });

      expect(viewWithSumErrors).toBeDefined();
      expect(viewWithSumAfter).toBeNull();
      expect(viewWithMinErrors).toBeDefined();
      expect(viewWithMinAfter).toBeNull();
      expect(viewWithAvgErrors).toBeDefined();
      expect(viewWithAvgAfter).toBeNull();

      const {
        data: { getCoreView: viewWithoutAggregateAfter },
        errors: viewWithoutAggregateErrors,
      } = await findOneCoreView({
        viewId: testSetup.viewWithoutAggregateId,
        gqlFields: VIEW_WITH_KANBAN_FIELDS,
        expectToFail: false,
      });

      expect(viewWithoutAggregateErrors).toBeUndefined();
      expect(isDefined(viewWithoutAggregateAfter)).toBe(true);
    });
});

