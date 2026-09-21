import { AiEvaluationService } from 'src/engine/metadata-modules/ai/ai-evaluation/services/ai-evaluation.service';
import { type AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type NativeEvaluationRunner } from 'src/engine/metadata-modules/ai/ai-evaluation/services/native-evaluation.runner';
import { type AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type AiEvaluationRequest } from 'src/engine/metadata-modules/ai/ai-evaluation/types/ai-evaluation-request.type';

const request: AiEvaluationRequest = {
  workspaceId: 'workspace',
  state: 'The customer is happy.',
  questions: {
    satisfied: { type: 'boolean', instructions: 'Is the customer satisfied?' },
  },
};

const setup = (available = true, allowed = true) => {
  const registry = {
    isModelAdminAllowed: jest.fn().mockReturnValue(allowed),
    getEvaluationModel: jest.fn().mockReturnValue(available ? {} : undefined),
  };
  const runner = {
    run: jest.fn().mockResolvedValue({ answers: {}, usage: {} }),
  };
  const billing = {
    assertAiExecutionAllowed: jest.fn().mockResolvedValue(undefined),
    calculateAndBillUsage: jest.fn().mockResolvedValue(undefined),
  };
  const service = new AiEvaluationService(
    registry as unknown as AiModelRegistryService,
    runner as unknown as NativeEvaluationRunner,
    billing as unknown as AiBillingService,
  );
  return { service, runner, billing };
};

describe('Jev-only evaluation', () => {
  it('runs and bills Jev directly', async () => {
    const { service, runner, billing } = setup();
    await expect(service.evaluate(request)).resolves.toMatchObject({
      modelId: 'typesafe-ai/jev-latest',
      runnerKind: 'evaluation-model',
    });
    expect(runner.run).toHaveBeenCalledWith(
      expect.objectContaining({ modelId: 'typesafe-ai/jev-latest' }),
    );
    expect(billing.calculateAndBillUsage).toHaveBeenCalled();
  });
  it.each([
    [false, true],
    [true, false],
  ])(
    'fails without fallback when available=%s and allowed=%s',
    async (available, allowed) => {
      const { service, runner, billing } = setup(available, allowed);
      await expect(service.evaluate(request)).rejects.toThrow(
        'Jev is unavailable',
      );
      expect(runner.run).not.toHaveBeenCalled();
      expect(billing.calculateAndBillUsage).not.toHaveBeenCalled();
    },
  );
  it('rejects a regular model override', async () => {
    const { service, runner } = setup();
    await expect(
      service.evaluate({ ...request, modelId: 'openai/gpt-4o' }),
    ).rejects.toThrow('Classify only supports Jev');
    expect(runner.run).not.toHaveBeenCalled();
  });
});
