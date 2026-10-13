import { createTurnUsageRecorder } from 'src/engine/metadata-modules/ai/ai-chat/utils/create-turn-usage-recorder.util';

type TestStep = { stepNumber: number };

type TestStepDebitResult = {
  hasNoMoreAvailableCredits: boolean;
  memberCreditsUsedMicro: number;
};

const createDeferredDebit = () => {
  let settleDebit: (result: TestStepDebitResult) => void = () => {};
  const debitPromise = new Promise<TestStepDebitResult>((resolve) => {
    settleDebit = resolve;
  });

  return { debitPromise, settleDebit };
};

const debited = { hasNoMoreAvailableCredits: false, memberCreditsUsedMicro: 0 };

const debitedWithMemberShare = (memberCreditsUsedMicro: number) => ({
  hasNoMoreAvailableCredits: false,
  memberCreditsUsedMicro,
});

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
      memberCreditsUsedMicro: 0,
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

  it('records the member share of every debited step', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await recorder.trackStepDebit(
      { stepNumber: 0 },
      Promise.resolve(debitedWithMemberShare(300)),
    );
    await recorder.trackStepDebit(
      { stepNumber: 1 },
      Promise.resolve(debitedWithMemberShare(0)),
    );
    await recorder.trackStepDebit(
      { stepNumber: 2 },
      Promise.resolve(debitedWithMemberShare(150)),
    );

    await recorder.recordOnce();

    expect(recordTurn).toHaveBeenCalledWith({
      steps: [{ stepNumber: 0 }, { stepNumber: 1 }, { stepNumber: 2 }],
      memberCreditsUsedMicro: 450,
    });
  });

  it('includes the member share of a step debit still pending at the exit', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });
    const { debitPromise, settleDebit } = createDeferredDebit();

    await recorder.trackStepDebit(
      { stepNumber: 0 },
      Promise.resolve(debitedWithMemberShare(100)),
    );
    void recorder.trackStepDebit({ stepNumber: 1 }, debitPromise);

    const recording = recorder.recordOnce();

    settleDebit(debitedWithMemberShare(250));
    await recording;

    expect(recordTurn).toHaveBeenCalledWith({
      steps: [{ stepNumber: 0 }, { stepNumber: 1 }],
      memberCreditsUsedMicro: 350,
    });
  });

  it('adds no member share for a step whose debit failed', async () => {
    const recordTurn = jest.fn().mockResolvedValue(undefined);
    const recorder = createTurnUsageRecorder<TestStep>({ recordTurn });

    await recorder.trackStepDebit(
      { stepNumber: 0 },
      Promise.resolve(debitedWithMemberShare(200)),
    );
    await expect(
      recorder.trackStepDebit(
        { stepNumber: 1 },
        Promise.reject<TestStepDebitResult>(new Error('Redis unavailable')),
      ),
    ).rejects.toThrow('Redis unavailable');

    await recorder.recordOnce();

    expect(recordTurn).toHaveBeenCalledWith({
      steps: [{ stepNumber: 0 }, { stepNumber: 1 }],
      memberCreditsUsedMicro: 200,
    });
  });
});
