import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { MAX_DICTATION_DURATION_SECONDS } from 'src/engine/metadata-modules/ai/ai-transcription/constants/dictation-audio-limits.const';
import { AiTranscriptionService } from 'src/engine/metadata-modules/ai/ai-transcription/services/ai-transcription.service';

const transcribeMock = jest.fn();

jest.mock('ai', () => ({
  experimental_transcribe: (...args: unknown[]) => transcribeMock(...args),
}));

const REGISTERED_MODEL = {
  modelId: 'azure-foundry/gpt-4o-transcribe',
  sdkPackage: '@ai-sdk/azure',
  model: { modelId: 'gpt-4o-transcribe' },
  providerName: 'azure-foundry',
};

const buildService = ({
  isDictationEnabled = true,
  hasTranscriptionModel = true,
  billTranscriptionUsage = jest.fn().mockResolvedValue(undefined),
}: {
  isDictationEnabled?: boolean;
  hasTranscriptionModel?: boolean;
  billTranscriptionUsage?: jest.Mock;
} = {}) => {
  const transcriptionModel = hasTranscriptionModel
    ? REGISTERED_MODEL
    : undefined;
  const registry = {
    getTranscriptionModel: jest.fn().mockReturnValue(transcriptionModel),
    getDefaultTranscriptionModel: jest.fn().mockReturnValue(transcriptionModel),
    getTranscriptionModelConfig: jest
      .fn()
      .mockReturnValue({ costPerMinute: 0.006 }),
  };
  const billing = { billTranscriptionUsage };
  const config = { get: jest.fn().mockReturnValue(isDictationEnabled) };

  const service = new AiTranscriptionService(
    registry as never,
    billing as never,
    config as never,
  );

  return { service, registry, billing, config };
};

const transcribeInput = {
  audio: Buffer.from('opus frames'),
  workspaceId: 'workspace-id',
  userWorkspaceId: 'user-workspace-id',
};

describe('AiTranscriptionService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    transcribeMock.mockResolvedValue({
      text: 'call Acme tomorrow',
      durationInSeconds: 12,
      language: 'en',
    });
  });

  it('passes the speaker language to the provider as an ISO-639-1 code', async () => {
    const { service } = buildService();

    await service.transcribeAudio({ ...transcribeInput, language: 'fr-FR' });

    expect(transcribeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        providerOptions: { openai: { language: 'fr' } },
      }),
    );
  });

  it('returns the transcript and bills the reported duration', async () => {
    const billTranscriptionUsage = jest.fn().mockResolvedValue(undefined);
    const { service } = buildService({ billTranscriptionUsage });

    const result = await service.transcribeAudio(transcribeInput);

    expect(result.text).toBe('call Acme tomorrow');
    expect(billTranscriptionUsage).toHaveBeenCalledWith(
      expect.objectContaining({ durationInSeconds: 12, costPerMinute: 0.006 }),
    );
  });

  // An operator who turns dictation off expects the endpoint to stop spending,
  // not just the button to disappear.
  it('refuses to call the provider when dictation is disabled', async () => {
    const { service } = buildService({ isDictationEnabled: false });

    await expect(
      service.transcribeAudio(transcribeInput),
    ).rejects.toMatchObject({
      code: AiExceptionCode.TRANSCRIPTION_NOT_CONFIGURED,
    });
    expect(transcribeMock).not.toHaveBeenCalled();
  });

  it('refuses when no transcription model is registered', async () => {
    const { service } = buildService({ hasTranscriptionModel: false });

    await expect(
      service.transcribeAudio(transcribeInput),
    ).rejects.toMatchObject({
      code: AiExceptionCode.TRANSCRIPTION_NOT_CONFIGURED,
    });
    expect(transcribeMock).not.toHaveBeenCalled();
  });

  // The byte cap is a weak proxy for duration because the caller picks the
  // bitrate, so the limit is what stops long recordings being transcribed.
  it('withholds the transcript when the audio runs over the duration limit', async () => {
    transcribeMock.mockResolvedValue({
      text: 'a very long recording',
      durationInSeconds: MAX_DICTATION_DURATION_SECONDS + 1,
      language: 'en',
    });
    const billTranscriptionUsage = jest.fn().mockResolvedValue(undefined);
    const { service } = buildService({ billTranscriptionUsage });

    await expect(
      service.transcribeAudio(transcribeInput),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AUDIO_INPUT });
    // The provider was paid either way, so the workspace is still charged.
    expect(billTranscriptionUsage).toHaveBeenCalledTimes(1);
  });

  it('accepts audio exactly at the duration limit', async () => {
    transcribeMock.mockResolvedValue({
      text: 'right at the limit',
      durationInSeconds: MAX_DICTATION_DURATION_SECONDS,
      language: 'en',
    });
    const { service } = buildService();

    await expect(
      service.transcribeAudio(transcribeInput),
    ).resolves.toMatchObject({ text: 'right at the limit' });
  });

  // Retrying would pay for the same audio twice.
  it('still returns the transcript when billing fails', async () => {
    const billTranscriptionUsage = jest
      .fn()
      .mockRejectedValue(new Error('redis unavailable'));
    const { service } = buildService({ billTranscriptionUsage });

    const result = await service.transcribeAudio(transcribeInput);

    expect(result.text).toBe('call Acme tomorrow');
  });

  // Unbillable and unbounded: accepting it would leave half an hour of
  // low-bitrate audio inside the byte cap transcribed for free.
  it('withholds the transcript when the provider reports no duration', async () => {
    transcribeMock.mockResolvedValue({
      text: 'no duration reported',
      durationInSeconds: undefined,
      language: undefined,
    });
    const billTranscriptionUsage = jest.fn().mockResolvedValue(undefined);
    const { service } = buildService({ billTranscriptionUsage });

    await expect(
      service.transcribeAudio(transcribeInput),
    ).rejects.toMatchObject({ code: AiExceptionCode.INVALID_AUDIO_INPUT });
    expect(billTranscriptionUsage).not.toHaveBeenCalled();
  });
});
