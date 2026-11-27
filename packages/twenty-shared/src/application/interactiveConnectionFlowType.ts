export type InteractiveConnectionStepTrigger =
  | 'start'
  | 'submit'
  | 'poll'
  | 'cancel';

export type InteractiveConnectionFieldKind =
  | 'text'
  | 'email'
  | 'password'
  | 'code';

export type InteractiveConnectionField = {
  key: string;
  label: string;
  kind: InteractiveConnectionFieldKind;
  placeholder?: string;
  defaultValue?: string;
};

export type InteractiveConnectionFormScreen = {
  type: 'form';
  title: string;
  description?: string;
  fields: InteractiveConnectionField[];
  submitLabel?: string;
  error?: string;
};

export type InteractiveConnectionWaitingScreen = {
  type: 'waiting';
  title: string;
  description?: string;
  pollIntervalSeconds: number;
};

export type InteractiveConnectionQrCodeScreen = {
  type: 'qr-code';
  title: string;
  description?: string;
  data: string;
  pollIntervalSeconds: number;
};

export type InteractiveConnectionScreen =
  | InteractiveConnectionFormScreen
  | InteractiveConnectionWaitingScreen
  | InteractiveConnectionQrCodeScreen;

export type InteractiveConnectionStepPayload<
  TState extends object = Record<string, unknown>,
> = {
  connectionProviderId: string;
  connectionProviderName: string;
  trigger: InteractiveConnectionStepTrigger;
  state: TState | null;
  values: Record<string, string>;
  locale: string;
};

export type InteractiveConnectionStepResult<
  TState extends object = Record<string, unknown>,
> =
  | { type: 'screen'; screen: InteractiveConnectionScreen; state: TState }
  | {
      type: 'done';
      externalAccountId: string;
      handle?: string;
      accessToken?: string;
    }
  | { type: 'cancelled' };
