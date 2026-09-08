import { isNonEmptyString } from '@sniptt/guards';

// Twenty stores a phone as a PHONES composite: the subscriber number and its
// calling code are SEPARATE subfields. Reading `primaryPhoneNumber` alone
// therefore yields a national number with no country — which is how a Moldovan
// caller reached the marketing rooms as "Client Number: 69143382" and the deal
// as "Deal | 69143382 | ARTIMA", both unusable for calling back or for matching
// against the +373 form the activity and the PBX already use.
//
// Every place that DISPLAYS or SENDS a person's phone must compose both halves,
// so the composition lives here once.

// Compose an E.164 number from Twenty's PHONES composite. Returns undefined
// when there's no number. callingCode may or may not carry a leading '+'.
export const toE164 = (
  callingCode: string | null | undefined,
  number: string | null | undefined,
): string | undefined => {
  if (!isNonEmptyString(number)) {
    return undefined;
  }

  if (!isNonEmptyString(callingCode)) {
    return number;
  }

  const normalizedCallingCode = callingCode.startsWith('+')
    ? callingCode
    : `+${callingCode}`;

  return `${normalizedCallingCode}${number}`;
};

type PersonWithPhones = {
  phones?: {
    primaryPhoneNumber?: string | null;
    primaryPhoneCallingCode?: string | null;
  } | null;
} | null;

// The composite read every display path wants. Kept separate from `toE164` so
// callers holding a loosely typed person row (the ORM repositories in these
// modules are `any`) do not each re-spell the two subfield names.
export const readPersonPhoneE164 = (
  person: PersonWithPhones,
): string | undefined =>
  toE164(
    person?.phones?.primaryPhoneCallingCode,
    person?.phones?.primaryPhoneNumber,
  );
