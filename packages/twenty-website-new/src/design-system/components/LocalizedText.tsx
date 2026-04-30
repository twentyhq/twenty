import type { I18n, MessageDescriptor } from '@lingui/core';
import { Trans } from '@lingui/react';

export type LocalizableText = string | MessageDescriptor;

export const isLocalizableMessageDescriptor = (
  text: LocalizableText,
): text is MessageDescriptor => typeof text !== 'string';

export const resolveLocalizableText = (
  i18n: I18n,
  text: LocalizableText,
): string => (isLocalizableMessageDescriptor(text) ? i18n._(text) : text);

export const getLocalizableTextSource = (text: LocalizableText): string =>
  isLocalizableMessageDescriptor(text) ? (text.message ?? text.id) : text;

type LocalizedTextProps = {
  text: LocalizableText;
};

export const LocalizedText = ({ text }: LocalizedTextProps) => {
  if (!isLocalizableMessageDescriptor(text)) {
    return <>{text}</>;
  }

  return (
    <Trans
      id={text.id}
      message={text.message}
      values={text.values}
      comment={text.comment}
    />
  );
};
