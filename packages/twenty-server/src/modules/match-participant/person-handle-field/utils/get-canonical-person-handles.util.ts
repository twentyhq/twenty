import { isNonEmptyString } from '@sniptt/guards';
import {
  FieldMetadataType,
  type EmailsMetadata,
  type LinksMetadata,
  type PhonesMetadata,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type PersonHandleField } from 'src/modules/match-participant/person-handle-field/types/person-handle-field.type';
import { canonicalizePersonHandle } from 'src/modules/match-participant/person-handle-field/utils/canonicalize-person-handle.util';

type CanonicalPersonHandles = {
  primary: string[];
  additional: string[];
};

const toPhoneValue = (phone: {
  number?: string | null;
  callingCode?: string | null;
}): string => `${phone.callingCode ?? ''}${phone.number ?? ''}`;

const getRawPersonHandles = ({
  type,
  value,
}: {
  type: PersonHandleField['type'];
  value: unknown;
}): { primary: (string | null | undefined)[]; additional: unknown[] } => {
  switch (type) {
    case FieldMetadataType.EMAILS: {
      const emails = value as EmailsMetadata | null | undefined;

      return {
        primary: [emails?.primaryEmail],
        additional: Array.isArray(emails?.additionalEmails)
          ? emails.additionalEmails
          : [],
      };
    }
    case FieldMetadataType.PHONES: {
      const phones = value as PhonesMetadata | null | undefined;

      return {
        primary: isNonEmptyString(phones?.primaryPhoneNumber)
          ? [
              toPhoneValue({
                number: phones.primaryPhoneNumber,
                callingCode: phones.primaryPhoneCallingCode,
              }),
            ]
          : [],
        additional: Array.isArray(phones?.additionalPhones)
          ? phones.additionalPhones.map(toPhoneValue)
          : [],
      };
    }
    case FieldMetadataType.LINKS: {
      const links = value as LinksMetadata | null | undefined;

      return {
        primary: [links?.primaryLinkUrl],
        additional: Array.isArray(links?.secondaryLinks)
          ? links.secondaryLinks.map((link) => link?.url)
          : [],
      };
    }
    case FieldMetadataType.TEXT:
      return { primary: [value as string | null | undefined], additional: [] };
  }
};

export const getCanonicalPersonHandles = ({
  type,
  value,
}: {
  type: PersonHandleField['type'];
  value: unknown;
}): CanonicalPersonHandles => {
  const { primary, additional } = getRawPersonHandles({ type, value });

  const canonicalize = (values: unknown[]) =>
    values
      .map((rawValue) =>
        canonicalizePersonHandle({
          type,
          value: typeof rawValue === 'string' ? rawValue : null,
        }),
      )
      .filter(isDefined);

  return {
    primary: canonicalize(primary),
    additional: canonicalize(additional),
  };
};
