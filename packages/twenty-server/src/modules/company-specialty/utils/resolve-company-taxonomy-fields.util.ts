import { isDefined } from 'twenty-shared/utils';

import {
  COMPANY_SPECIALTY_OPTIONS,
  INTERNAL_MEDICINE_SPECIALTY,
  INTERNAL_MEDICINE_SUBSPECIALTY_OPTIONS,
} from 'src/modules/company-specialty/constants/company-taxonomy-options.constant';
import { type CompanyTaxonomyFields } from 'src/modules/company-specialty/types/company-taxonomy-fields.type';
import { type CompanyTaxonomyOption } from 'src/modules/company-specialty/types/company-taxonomy-option.type';

const findTaxonomyCode = (
  options: readonly CompanyTaxonomyOption[],
  value: string | null,
) => options.find((option) => option.value === value)?.taxonomyCode;

// A subspecialty implies Internal Medicine, and the most specific code wins.
// Without the stored record, clearing only the subspecialty can't be resolved, so it is left as sent.
export const resolveCompanyTaxonomyFields = <
  TData extends CompanyTaxonomyFields,
>({
  data,
  existing,
}: {
  data: TData;
  existing?: CompanyTaxonomyFields;
}): TData => {
  const hasSpecialty = 'specialty' in data;
  const hasSubspecialty = 'subspecialty' in data;

  if (!hasSpecialty && !hasSubspecialty) {
    return data;
  }

  const specialty = hasSpecialty
    ? (data.specialty ?? null)
    : isDefined(data.subspecialty)
      ? INTERNAL_MEDICINE_SPECIALTY
      : existing?.specialty;

  if (specialty === undefined) {
    return data;
  }

  const subspecialty =
    specialty === INTERNAL_MEDICINE_SPECIALTY
      ? hasSubspecialty
        ? (data.subspecialty ?? null)
        : (existing?.subspecialty ?? null)
      : null;

  return {
    ...data,
    specialty,
    subspecialty,
    taxonomyCode:
      findTaxonomyCode(INTERNAL_MEDICINE_SUBSPECIALTY_OPTIONS, subspecialty) ??
      findTaxonomyCode(COMPANY_SPECIALTY_OPTIONS, specialty) ??
      null,
  };
};
