import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkflowFormActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { WorkflowTriggerException } from 'src/modules/workflow/workflow-trigger/exceptions/workflow-trigger.exception';
import { assertFormStepIsValid } from 'src/modules/workflow/workflow-trigger/utils/assert-form-step-is-valid.util';

const settings: WorkflowFormActionSettings = {
  input: [
    {
      id: 'af2009ca-f263-4bd7-9361-f3323eca4ef2',
      name: 'text',
      type: FieldMetadataType.TEXT,
      label: 'Text',
    },
    {
      id: '3cc0d22a-e6e7-4c07-b45b-c4fbb83ba3bf',
      name: 'record',
      type: 'RECORD',
      label: 'Record',
      settings: {
        objectName: 'company',
      },
      placeholder: '',
    },
  ],
  outputSchema: {
    text: {
      type: FieldMetadataType.TEXT,
      label: 'Text',
      value: 'My text',
      isLeaf: true,
    },
    record: {
      label: 'Record',
      value: {
        fields: {
          id: {
            icon: 'Icon123',
            type: FieldMetadataType.UUID,
            label: 'Id',
            value: '123e4567-e89b-12d3-a456-426614174000',
            isLeaf: true,
            fieldMetadataId: '123e4567-e89b-12d3-a456-426614174000',
          },
        },
        object: {
          icon: 'IconBuildingSkyscraper',
          label: 'Company',
          value: 'A company',
          isLeaf: true,
          fieldIdName: 'id',
          objectMetadataId: '123e4567-e89b-12d3-a456-426614174000',
        },
        _outputSchemaType: 'RECORD',
      },
      isLeaf: false,
    },
  },
  errorHandlingOptions: {
    retryOnFailure: {
      value: false,
    },
    continueOnFailure: {
      value: false,
    },
  },
};

describe('assertFormStepIsValid', () => {
  it('should throw an exception when input is not provided', () => {
    const invalidSettings: WorkflowFormActionSettings = {
      ...settings,
      // @ts-expect-error Intentionally invalid input
      input: undefined,
    };

    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      WorkflowTriggerException,
    );
    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      'No input provided in form step',
    );
  });

  it('should throw an exception when input array is empty', () => {
    const invalidSettings: WorkflowFormActionSettings = {
      ...settings,
      input: [],
    };

    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      WorkflowTriggerException,
    );
    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      'Form action must have at least one field',
    );
  });

  it('should throw an exception when field names are not unique', () => {
    const invalidSettings: WorkflowFormActionSettings = {
      ...settings,
      input: [
        {
          id: 'af2009ca-f263-4bd7-9361-f3323eca4ef2',
          name: 'text',
          type: FieldMetadataType.TEXT,
          label: 'Text',
        },
        {
          id: '3cc0d22a-e6e7-4c07-b45b-c4fbb83ba3bf',
          name: 'text',
          type: FieldMetadataType.TEXT,
          label: 'Text Duplicate',
        },
      ],
    };

    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      WorkflowTriggerException,
    );
    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      'Form action fields must have unique names',
    );
  });

  it('should throw an exception when field label is not defined', () => {
    const invalidSettings: WorkflowFormActionSettings = {
      ...settings,
      input: [
        {
          id: 'af2009ca-f263-4bd7-9361-f3323eca4ef2',
          name: 'text',
          type: FieldMetadataType.TEXT,
          label: '',
        },
      ],
    };

    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      WorkflowTriggerException,
    );
    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      'Form action fields must have a defined label and type',
    );
  });

  it('should throw an exception when field type is not defined', () => {
    const invalidSettings: WorkflowFormActionSettings = {
      ...settings,
      input: [
        {
          id: 'af2009ca-f263-4bd7-9361-f3323eca4ef2',
          name: 'text',
          // @ts-expect-error Intentionally invalid type
          type: '',
          label: 'Text',
        },
      ],
    };

    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      WorkflowTriggerException,
    );
    expect(() => assertFormStepIsValid(invalidSettings)).toThrow(
      'Form action fields must have a defined label and type',
    );
  });

  it('should not throw an exception for valid form settings', () => {
    expect(() => assertFormStepIsValid(settings)).not.toThrow();
  });
});
