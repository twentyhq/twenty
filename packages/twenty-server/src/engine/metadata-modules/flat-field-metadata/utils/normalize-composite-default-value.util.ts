import {
  FieldMetadataType,
  type FieldMetadataDefaultValueForAnyType,
} from 'twenty-shared/types';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';

import { isNullEquivalentArrayFieldValue } from 'src/engine/api/common/common-args-processors/data-arg-processor/utils/is-null-equivalent-array-field-value.util';
import { CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';

const isNullEquivalentTextDefaultValue = (value: unknown): boolean =>
  value === "''" || value === '';

export const normalizeCompositeDefaultValue = (
  defaultValue: FieldMetadataDefaultValueForAnyType,
  type: CompositeFieldMetadataType,
): FieldMetadataDefaultValueForAnyType => {
  switch (type) {
    case FieldMetadataType.PHONES: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        primaryPhoneNumber?: string | null;
        primaryPhoneCountryCode?: string | null;
        primaryPhoneCallingCode?: string | null;
        additionalPhones?: object | null;
      };

      const primaryPhoneNumber = isNullEquivalentTextDefaultValue(v.primaryPhoneNumber)
        ? null
        : (v.primaryPhoneNumber ?? null);
      const primaryPhoneCountryCode = isNullEquivalentTextDefaultValue(
        v.primaryPhoneCountryCode,
      )
        ? null
        : (v.primaryPhoneCountryCode ?? null);
      const primaryPhoneCallingCode = isNullEquivalentTextDefaultValue(
        v.primaryPhoneCallingCode,
      )
        ? null
        : (v.primaryPhoneCallingCode ?? null);
      const additionalPhones = isNullEquivalentArrayFieldValue(v.additionalPhones)
        ? null
        : (v.additionalPhones ?? null);

      if (
        primaryPhoneNumber === null &&
        primaryPhoneCountryCode === null &&
        primaryPhoneCallingCode === null &&
        additionalPhones === null
      ) {
        return null;
      }

      return {
        primaryPhoneNumber,
        primaryPhoneCountryCode,
        primaryPhoneCallingCode,
        additionalPhones,
      };
    }

    case FieldMetadataType.EMAILS: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        primaryEmail?: string | null;
        additionalEmails?: object | null;
      };

      const primaryEmail = isNullEquivalentTextDefaultValue(v.primaryEmail)
        ? null
        : (v.primaryEmail ?? null);
      const additionalEmails = isNullEquivalentArrayFieldValue(v.additionalEmails)
        ? null
        : (v.additionalEmails ?? null);

      if (primaryEmail === null && additionalEmails === null) {
        return null;
      }

      return { primaryEmail, additionalEmails };
    }

    case FieldMetadataType.LINKS: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        primaryLinkLabel?: string | null;
        primaryLinkUrl?: string | null;
        secondaryLinks?: object | null;
      };

      const primaryLinkLabel = isNullEquivalentTextDefaultValue(v.primaryLinkLabel)
        ? null
        : (v.primaryLinkLabel ?? null);
      const primaryLinkUrl = isNullEquivalentTextDefaultValue(v.primaryLinkUrl)
        ? null
        : (v.primaryLinkUrl ?? null);
      const secondaryLinks = isNullEquivalentArrayFieldValue(v.secondaryLinks)
        ? null
        : (v.secondaryLinks ?? null);

      if (
        primaryLinkLabel === null &&
        primaryLinkUrl === null &&
        secondaryLinks === null
      ) {
        return null;
      }

      return { primaryLinkLabel, primaryLinkUrl, secondaryLinks };
    }

    case FieldMetadataType.ADDRESS: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        addressStreet1?: string | null;
        addressStreet2?: string | null;
        addressCity?: string | null;
        addressState?: string | null;
        addressCountry?: string | null;
        addressPostcode?: string | null;
        addressLat?: number | null;
        addressLng?: number | null;
      };

      const addressStreet1 = isNullEquivalentTextDefaultValue(v.addressStreet1)
        ? null
        : (v.addressStreet1 ?? null);
      const addressStreet2 = isNullEquivalentTextDefaultValue(v.addressStreet2)
        ? null
        : (v.addressStreet2 ?? null);
      const addressCity = isNullEquivalentTextDefaultValue(v.addressCity)
        ? null
        : (v.addressCity ?? null);
      const addressState = isNullEquivalentTextDefaultValue(v.addressState)
        ? null
        : (v.addressState ?? null);
      const addressCountry = isNullEquivalentTextDefaultValue(v.addressCountry)
        ? null
        : (v.addressCountry ?? null);
      const addressPostcode = isNullEquivalentTextDefaultValue(v.addressPostcode)
        ? null
        : (v.addressPostcode ?? null);
      const addressLat = v.addressLat ?? null;
      const addressLng = v.addressLng ?? null;

      if (
        addressStreet1 === null &&
        addressStreet2 === null &&
        addressCity === null &&
        addressState === null &&
        addressCountry === null &&
        addressPostcode === null &&
        addressLat === null &&
        addressLng === null
      ) {
        return null;
      }

      return {
        addressStreet1,
        addressStreet2,
        addressCity,
        addressState,
        addressCountry,
        addressPostcode,
        addressLat,
        addressLng,
      };
    }

    case FieldMetadataType.FULL_NAME: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        firstName?: string | null;
        lastName?: string | null;
      };

      const firstName = isNullEquivalentTextDefaultValue(v.firstName)
        ? null
        : (v.firstName ?? null);
      const lastName = isNullEquivalentTextDefaultValue(v.lastName)
        ? null
        : (v.lastName ?? null);

      if (firstName === null && lastName === null) {
        return null;
      }

      return { firstName, lastName };
    }

    case FieldMetadataType.ACTOR: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        source?: string | null;
        workspaceMemberId?: string | null;
        name?: string | null;
        context?: object | null;
      };

      const source = v.source ?? null;
      const workspaceMemberId = v.workspaceMemberId ?? null;
      const name = isNullEquivalentTextDefaultValue(v.name)
        ? null
        : (v.name ?? null);
      const context = v.context ?? null;

      if (
        source === null &&
        workspaceMemberId === null &&
        name === null &&
        context === null
      ) {
        return null;
      }

      return { source, workspaceMemberId, name, context };
    }

    case FieldMetadataType.CURRENCY: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        amountMicros?: number | null;
        currencyCode?: string | null;
      };

      const amountMicros = v.amountMicros ?? null;
      const currencyCode = isNullEquivalentTextDefaultValue(v.currencyCode)
        ? null
        : (v.currencyCode ?? null);

      if (amountMicros === null && currencyCode === null) {
        return null;
      }

      return { amountMicros, currencyCode };
    }

    case FieldMetadataType.RICH_TEXT: {
      if (!isDefined(defaultValue)) {
        return null;
      }

      const v = defaultValue as {
        blocknote?: string | null;
        markdown?: string | null;
      };

      const blocknote = isNullEquivalentTextDefaultValue(v.blocknote)
        ? null
        : (v.blocknote ?? null);
      const markdown = isNullEquivalentTextDefaultValue(v.markdown)
        ? null
        : (v.markdown ?? null);

      if (blocknote === null && markdown === null) {
        return null;
      }

      return { blocknote, markdown };
    }

    default:
      assertUnreachable(type);
  }
};
