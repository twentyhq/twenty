// The Lingui lint gate skips arguments of this call: use it for text that must stay as written.
export const doNotTranslate = <TValue>(value: TValue): TValue => value;
