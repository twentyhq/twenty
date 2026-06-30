import { isNonEmptyString } from '@sniptt/guards';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';

type StandardOverridesTranslations = Partial<
  Record<string, Record<string, string | null> | null>
>;

type StandardOverridesRow = {
  workspaceId: string;
  standardOverrides: {
    translations?: StandardOverridesTranslations | null;
  } | null;
};

export type ObjectStandardOverridesRow = StandardOverridesRow & {
  labelSingular: string | null;
  labelPlural: string | null;
  description: string | null;
};

export type FieldStandardOverridesRow = StandardOverridesRow & {
  label: string | null;
  description: string | null;
};

export type WorkspaceTranslationMigrationEntry = {
  workspaceId: string;
  locale: string;
  messages: Record<string, string>;
};

// Turns the legacy element-keyed `standardOverrides.translations` (per
// object/field) into value-keyed workspace catalog entries (per workspace +
// locale), keyed by the source string's message id. Same-string collisions
// across elements collapse onto one message id (last write wins).
export const buildWorkspaceTranslationMessagesFromStandardOverrides = ({
  objectRows,
  fieldRows,
}: {
  objectRows: ObjectStandardOverridesRow[];
  fieldRows: FieldStandardOverridesRow[];
}): WorkspaceTranslationMigrationEntry[] => {
  const messagesByWorkspaceAndLocale = new Map<
    string,
    Map<string, Record<string, string>>
  >();

  const addOverride = (
    workspaceId: string,
    locale: string,
    sourceValue: string | null,
    value: string | null,
  ) => {
    if (!isNonEmptyString(sourceValue) || !isNonEmptyString(value)) {
      return;
    }

    if (!messagesByWorkspaceAndLocale.has(workspaceId)) {
      messagesByWorkspaceAndLocale.set(workspaceId, new Map());
    }

    const messagesByLocale = messagesByWorkspaceAndLocale.get(workspaceId);

    if (messagesByLocale === undefined) {
      return;
    }

    if (!messagesByLocale.has(locale)) {
      messagesByLocale.set(locale, {});
    }

    const messages = messagesByLocale.get(locale);

    if (messages === undefined) {
      return;
    }

    messages[generateMessageId(sourceValue)] = value;
  };

  const processRow = (
    workspaceId: string,
    translations: StandardOverridesTranslations | null | undefined,
    sourceByKey: Record<string, string | null>,
  ) => {
    for (const [locale, valueByKey] of Object.entries(translations ?? {})) {
      if (valueByKey === null || valueByKey === undefined) {
        continue;
      }

      for (const [key, value] of Object.entries(valueByKey)) {
        addOverride(workspaceId, locale, sourceByKey[key] ?? null, value);
      }
    }
  };

  for (const objectRow of objectRows) {
    processRow(
      objectRow.workspaceId,
      objectRow.standardOverrides?.translations,
      {
        labelSingular: objectRow.labelSingular,
        labelPlural: objectRow.labelPlural,
        description: objectRow.description,
      },
    );
  }

  for (const fieldRow of fieldRows) {
    processRow(fieldRow.workspaceId, fieldRow.standardOverrides?.translations, {
      label: fieldRow.label,
      description: fieldRow.description,
    });
  }

  const entries: WorkspaceTranslationMigrationEntry[] = [];

  for (const [
    workspaceId,
    messagesByLocale,
  ] of messagesByWorkspaceAndLocale.entries()) {
    for (const [locale, messages] of messagesByLocale.entries()) {
      entries.push({ workspaceId, locale, messages });
    }
  }

  return entries;
};
