import { createTurnUsageRecorder } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-turn-usage-recorder.util';

type TestStep = { stepNumber: number };

type TestStepDebitResult = { hasNoMoreAvailableCredits: boolean };

const createDeferredDebit = () => {
  let settleDebit: (result: TestStepDebitResult) => void = () => {};
  const debitPromise = new Promise<TestStepDebitResult>((resolve) => {
    settleDebit = resolve;
  });

  return { debitPromise, settleDebit };
};

const debited = { hasNoMoreAvailableCredits: false };

describe('createTurnUsageRecorder', () => {
  it('records the debited steps once across success, abort and error exits', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await recorder.trackStepDebit({ stepNumber: 0 }, Promise.resolve(debited));
    await recorder.trackStepDebit({ stepNumber: 1 }, Promise.resolve(debited));

    await recorder.recordOnce();
    await recorder.recordOnce();
    await recorder.recordOnce();

    expect(recordTurn).toHaveBeenCalledTimes(1);
    expect(recordTurn).toHaveBeenCalledWith({
      steps: [{ stepNumber: 0 }, { stepNumber: 1 }],
    });
  });

  it('records once when two exits run while a step debit is pending', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });
    const { debitPromise, settleDebit } = createDeferredDebit();

    void recorder.trackStepDebit({ stepNumber: 0 }, debitPromise);

    const abortExit = recorder.recordOnce();
    const errorExit = recorder.recordOnce();

    settleDebit(debited);
    await Promise.all([abortExit, errorExit]);

    expect(recordTurn).toHaveBeenCalledTimes(1);
  });

  it('waits for pending step debits before recording', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });
    const { debitPromise, settleDebit } = createDeferredDebit();

    void recorder.trackStepDebit({ stepNumber: 0 }, debitPromise);

    const recording = recorder.recordOnce();

    await jest.runAllTimersAsync();
    expect(recordTurn).not.toHaveBeenCalled();

    settleDebit(debited);
    await recording;

    expect(recordTurn).toHaveBeenCalledWith({ steps: [{ stepNumber: 0 }] });
  });

  it('records a step whose debit failed', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await expect(
      recorder.trackStepDebit(
        { stepNumber: 0 },
        Promise.reject(new Error('Redis unavailable')),
      ),
    ).rejects.toThrow('Redis unavailable');

    await recorder.recordOnce();

    expect(recordTurn).toHaveBeenCalledWith({ steps: [{ stepNumber: 0 }] });
  });

  it('records nothing when no step was debited', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await recorder.recordOnce();

    expect(recordTurn).not.toHaveBeenCalled();
  });

  it('does not retry a record that failed', async () => {
    const recordTurn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Record failed'))
      .mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await recorder.trackStepDebit({ stepNumber: 0 }, Promise.resolve(debited));

    await expect(recorder.recordOnce()).rejects.toThrow('Record failed');
    await recorder.recordOnce();

    expect(recordTurn).toHaveBeenCalledTimes(1);
  });
});
