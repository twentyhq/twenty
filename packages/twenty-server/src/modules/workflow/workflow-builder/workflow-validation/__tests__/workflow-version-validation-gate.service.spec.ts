import { FieldMetadataType } from 'twenty-shared/types';

import { WorkflowVersionValidationGateService } from 'src/modules/workflow/workflow-builder/workflow-validation/workflow-version-validation-gate.service';

const objectId = 'aaaaaaaa-0000-4000-8000-000000000001';
const richTextFieldId = 'bbbbbbbb-0000-4000-8000-000000000002';

const flatEntityMaps = {
  objectIdByNameSingular: { task: objectId },
  flatObjectMetadataMaps: {
    universalIdentifierById: { [objectId]: objectId },
    byUniversalIdentifier: {
      [objectId]: { id: objectId, fieldIds: [richTextFieldId] },
    },
  },
  flatFieldMetadataMaps: {
    universalIdentifierById: { [richTextFieldId]: richTextFieldId },
    byUniversalIdentifier: {
      [richTextFieldId]: {
        id: richTextFieldId,
        name: 'body',
        type: FieldMetadataType.RICH_TEXT,
      },
    },
  },
};

const buildGate = () => {
  const workflowMetadataReadService = {
    getFlatEntityMaps: jest.fn().mockResolvedValue(flatEntityMaps),
  };

  return new WorkflowVersionValidationGateService(
    workflowMetadataReadService as never,
  );
};

const buildCreateRecordStep = (objectRecord: Record<string, unknown>) => ({
  id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  name: 'Create task',
  type: 'CREATE_RECORD',
  valid: true,
  settings: {
    input: { objectName: 'task', objectRecord },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
});

const assert = (gate: WorkflowVersionValidationGateService, steps: unknown) =>
  gate.assertWorkflowVersionIsValidOrThrow({
    workspaceId: 'workspace-id',
    trigger: null,
    steps: steps as never,
  });

describe('WorkflowVersionValidationGateService', () => {
  it('rejects a bare-string RICH_TEXT value', async () => {
    const gate = buildGate();

    await expect(
      assert(gate, [buildCreateRecordStep({ body: 'Latest donation {{x}}' })]),
    ).rejects.toThrow('Workflow version is invalid');
  });

  it('accepts a valid RICH_TEXT object value', async () => {
    const gate = buildGate();

    await expect(
      assert(gate, [
        buildCreateRecordStep({ body: { blocknote: '[]', markdown: null } }),
      ]),
    ).resolves.toBeUndefined();
  });

  it('rejects a structurally malformed step (zod)', async () => {
    const gate = buildGate();

    await expect(
      assert(gate, [{ id: 'x', type: 'CREATE_RECORD' }]),
    ).rejects.toThrow('Workflow version is invalid');
  });
});
