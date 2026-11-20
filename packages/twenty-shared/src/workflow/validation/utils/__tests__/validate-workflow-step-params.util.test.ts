import { type ValidatableWorkflow } from '@/workflow/validation/types/WorkflowValidation';
import { validateWorkflowStepParams } from '../validate-workflow-step-params.util';

describe('validateWorkflowStepParams', () => {
  it('should return no issues when there is no trigger and no steps', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: undefined,
    };

    expect(validateWorkflowStepParams(workflow)).toEqual([]);
  });

  it('should flag an invalid trigger configuration', () => {
    const workflow: ValidatableWorkflow = {
      trigger: { type: 'NOT_A_REAL_TRIGGER' },
      steps: [],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some((issue) => issue.code === 'INVALID_TRIGGER_PARAMS'),
    ).toBe(true);
  });

  it('should flag an invalid step configuration with its step id', () => {
    const workflow: ValidatableWorkflow = {
      trigger: undefined,
      steps: [{ id: 'step-1', type: 'NOT_A_REAL_ACTION' }],
    };

    const issues = validateWorkflowStepParams(workflow);

    expect(
      issues.some(
        (issue) =>
          issue.code === 'INVALID_STEP_PARAMS' && issue.stepId === 'step-1',
      ),
    ).toBe(true);
  });

  describe('email step body', () => {
    const emailStepWithBody = (body: string, type = 'SEND_EMAIL') => ({
      id: '8d5a0b6c-3f1e-4e4a-9a3b-2f6d1c0e7a11',
      name: 'Send email',
      type,
      valid: true,
      settings: {
        input: { connectedAccountId: '', recipients: {}, body },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    });

    const bodyIssues = (body: string, type?: string) =>
      validateWorkflowStepParams({
        trigger: undefined,
        steps: [emailStepWithBody(body, type)],
      });

    it('should accept serialized email documents, with or without a schema version', () => {
      const content = [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
      ];

      expect(bodyIssues(JSON.stringify({ type: 'doc', content }))).toEqual([]);
      expect(
        bodyIssues(
          JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content }),
        ),
      ).toEqual([]);
    });

    it('should accept a blank body, which runs as an empty document', () => {
      expect(bodyIssues('')).toEqual([]);
      expect(bodyIssues('  ', 'DRAFT_EMAIL')).toEqual([]);
    });

    it('should reject HTML and plain text bodies of send and draft steps', () => {
      for (const [body, type] of [
        ['<p>Hi</p>', 'SEND_EMAIL'],
        ['Hi {{trigger.name}},\n\nThanks', 'DRAFT_EMAIL'],
      ] as const) {
        expect(bodyIssues(body, type)).toEqual([
          expect.objectContaining({
            code: 'INVALID_STEP_PARAMS',
            stepId: '8d5a0b6c-3f1e-4e4a-9a3b-2f6d1c0e7a11',
            message: expect.stringContaining(
              'must be a serialized email document',
            ),
          }),
        ]);
      }
    });
  });

  describe('fieldsToUpdate', () => {
    const recordStepWithInput = ({
      type,
      input,
    }: {
      type: string;
      input: object;
    }) => ({
      id: '2b7c4e1a-5d3f-4a8b-9c6e-1f0a2d3b4c5e',
      name: 'Record step',
      type,
      valid: true,
      settings: {
        input,
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    });

    const recordStepIssues = ({
      type,
      input,
    }: {
      type: string;
      input: object;
    }) =>
      validateWorkflowStepParams({
        trigger: undefined,
        steps: [recordStepWithInput({ type, input })],
      });

    it('should refuse fieldsToUpdate on create and upsert record steps, empty or not', () => {
      for (const fieldsToUpdate of [['name'], []]) {
        for (const type of ['CREATE_RECORD', 'UPSERT_RECORD']) {
          expect(
            recordStepIssues({
              type,
              input: {
                objectName: 'company',
                objectRecord: { name: 'Acme' },
                fieldsToUpdate,
              },
            }),
          ).toEqual([
            expect.objectContaining({
              code: 'INVALID_STEP_PARAMS',
              message: expect.stringContaining(
                'Step "Record step" configuration is invalid - settings.input: Unrecognized key: "fieldsToUpdate"',
              ),
            }),
          ]);
        }
      }
    });

    it('should accept create and upsert record steps without fieldsToUpdate', () => {
      for (const type of ['CREATE_RECORD', 'UPSERT_RECORD']) {
        expect(
          recordStepIssues({
            type,
            input: { objectName: 'company', objectRecord: { name: 'Acme' } },
          }),
        ).toEqual([]);
      }
    });

    it('should block activating an update record step with no field to update', () => {
      const updateRecordInput = {
        objectName: 'company',
        objectRecordId: '{{trigger.id}}',
        objectRecord: { name: 'Acme' },
      };

      expect(
        recordStepIssues({
          type: 'UPDATE_RECORD',
          input: { ...updateRecordInput, fieldsToUpdate: [] },
        }),
      ).toEqual([
        expect.objectContaining({
          code: 'UPDATE_RECORD_MISSING_FIELDS_TO_UPDATE',
        }),
      ]);
      expect(
        recordStepIssues({
          type: 'UPDATE_RECORD',
          input: { ...updateRecordInput, fieldsToUpdate: ['name'] },
        }),
      ).toEqual([]);
    });
  });

  describe('step filter operands', () => {
    const stepFilterGroups = [{ id: 'group-1', logicalOperator: 'AND' }];

    const buildStepFilter = ({
      type,
      operand,
      compositeFieldSubFieldName,
    }: {
      type: string;
      operand: string;
      compositeFieldSubFieldName?: string;
    }) => ({
      id: 'filter-1',
      type,
      stepOutputKey: '{{trigger.properties.after.companyId}}',
      operand,
      value: '',
      stepFilterGroupId: 'group-1',
      compositeFieldSubFieldName,
    });

    const buildFilterStep = ({
      type,
      stepFilters,
    }: {
      type: 'FILTER' | 'IF_ELSE';
      stepFilters: ReturnType<typeof buildStepFilter>[];
    }) => ({
      id: '4f1c2d3e-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
      name: 'Check company',
      type,
      valid: true,
      settings: {
        input: {
          stepFilterGroups,
          stepFilters,
          ...(type === 'IF_ELSE' ? { branches: [] } : {}),
        },
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
      },
    });

    it('should block activating filter and if/else steps whose operand the field type does not support', () => {
      for (const type of ['FILTER', 'IF_ELSE'] as const) {
        expect(
          validateWorkflowStepParams({
            trigger: undefined,
            steps: [
              buildFilterStep({
                type,
                stepFilters: [
                  buildStepFilter({ type: 'RELATION', operand: 'IS_NOT_NULL' }),
                ],
              }),
            ],
          }),
        ).toEqual([
          expect.objectContaining({
            code: 'UNSUPPORTED_STEP_FILTER_OPERAND',
            stepId: '4f1c2d3e-6a7b-4c8d-9e0f-1a2b3c4d5e6f',
            message:
              'Step "Check company" has a RELATION filter with operand "IS_NOT_NULL", which is not supported for this filter type. Use one of: IS, IS_NOT, IS_EMPTY, IS_NOT_EMPTY.',
          }),
        ]);
      }
    });

    it('should accept operands the filter editor offers, including deprecated spellings', () => {
      expect(
        validateWorkflowStepParams({
          trigger: undefined,
          steps: [
            buildFilterStep({
              type: 'FILTER',
              stepFilters: [
                buildStepFilter({ type: 'RELATION', operand: 'isNotEmpty' }),
                buildStepFilter({
                  type: 'ACTOR',
                  operand: 'IS_NOT',
                  compositeFieldSubFieldName: 'source',
                }),
                buildStepFilter({ type: 'boolean', operand: 'IS' }),
                buildStepFilter({ type: 'unknown', operand: 'CONTAINS' }),
              ],
            }),
          ],
        }),
      ).toEqual([]);
    });

    it('should block activating a database event trigger whose filter operand the field type does not support', () => {
      const databaseEventTrigger = {
        type: 'DATABASE_EVENT',
        settings: {
          eventName: 'person.updated',
          outputSchema: {},
          filter: {
            stepFilterGroups,
            stepFilters: [
              buildStepFilter({ type: 'NUMBER', operand: 'IS_NOT_NULL' }),
            ],
          },
        },
      };

      expect(
        validateWorkflowStepParams({
          trigger: databaseEventTrigger,
          steps: [],
        }),
      ).toEqual([
        expect.objectContaining({
          code: 'UNSUPPORTED_STEP_FILTER_OPERAND',
          message: expect.stringContaining(
            'The trigger has a NUMBER filter with operand "IS_NOT_NULL"',
          ),
        }),
      ]);
    });
  });
});
