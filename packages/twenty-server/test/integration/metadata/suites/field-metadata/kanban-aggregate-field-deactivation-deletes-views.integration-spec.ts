import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { updateOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/update-one-field-metadata.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneCoreView } from 'test/integration/metadata/suites/view/utils/create-one-core-view.util';
import { findOneCoreView } from 'test/integration/metadata/suites/view/utils/find-one-core-view.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';
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

describe('kanban-aggregate-field-deactivation-deletes-views', () => {
  let testSetup: TestSetup;

  const verifyViewExists = async (viewId: string, shouldExist: boolean) => {
    const {
      data: { getCoreView },
    } = await findOneCoreView({
      viewId,
      gqlFields: VIEW_WITH_KANBAN_FIELDS,
      expectToFail: false,
    });

    if (shouldExist) {
      expect(isDefined(getCoreView)).toBe(true);
    } else {
      expect(getCoreView).toBeNull();
    }

    return getCoreView;
  };

  const deactivateFieldAndVerify = async (fieldId: string) => {
    const { data, errors } = await updateOneFieldMetadata({
      expectToFail: false,
      input: {
        idToUpdate: fieldId,
        updatePayload: { isActive: false },
      },
      gqlFields: `
        id
        isActive
      `,
    });

    expect(errors).toBeUndefined();
    expect(data.updateOneField.id).toBe(fieldId);
    expect(data.updateOneField.isActive).toBe(false);
  };

  beforeEach(async () => {
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
      data: { createCoreView: viewWithAggregate },
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
      data: { createCoreView: viewWithoutAggregate },
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

  it('should delete view when field used as kanbanAggregateOperationFieldMetadataId is deactivated', async () => {
    const initialViewWithAggregate = await verifyViewExists(
      testSetup.viewWithAggregateId,
      true,
    );

    await verifyViewExists(testSetup.viewWithoutAggregateId, true);

    expect(
      initialViewWithAggregate.kanbanAggregateOperationFieldMetadataId,
    ).toBe(testSetup.aggregateFieldMetadataId);
    expect(initialViewWithAggregate.kanbanAggregateOperation).toBe('SUM');

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyViewExists(testSetup.viewWithAggregateId, false);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);
  });

  it('should not delete view when field not used as kanbanAggregateOperationFieldMetadataId is deactivated', async () => {
    await verifyViewExists(testSetup.viewWithAggregateId, true);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);

    await deactivateFieldAndVerify(testSetup.nonAggregateFieldMetadataId);

    await verifyViewExists(testSetup.viewWithAggregateId, true);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);
  });

  it('should delete multiple views when they all use the same field as kanbanAggregateOperationFieldMetadataId', async () => {
    const {
      data: { createCoreView: secondViewWithAggregate },
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

    await verifyViewExists(testSetup.viewWithAggregateId, true);
    await verifyViewExists(secondViewWithAggregate.id, true);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyViewExists(testSetup.viewWithAggregateId, false);
    await verifyViewExists(secondViewWithAggregate.id, false);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);
  });

  it('should handle deactivation when view has different aggregate operations on same field', async () => {
    const {
      data: { createCoreView: viewWithMin },
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
      data: { createCoreView: viewWithAvg },
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

    await verifyViewExists(testSetup.viewWithAggregateId, true);
    await verifyViewExists(viewWithMin.id, true);
    await verifyViewExists(viewWithAvg.id, true);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);

    await deactivateFieldAndVerify(testSetup.aggregateFieldMetadataId);

    await verifyViewExists(testSetup.viewWithAggregateId, false);
    await verifyViewExists(viewWithMin.id, false);
    await verifyViewExists(viewWithAvg.id, false);
    await verifyViewExists(testSetup.viewWithoutAggregateId, true);
  });
});
