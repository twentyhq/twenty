import { resolveCompanyTaxonomyFields } from 'src/modules/company-specialty/utils/resolve-company-taxonomy-fields.util';

describe('resolveCompanyTaxonomyFields', () => {
  it('should leave writes that do not touch the specialty untouched', () => {
    const data = { name: 'TMC', taxonomyCode: null };

    expect(resolveCompanyTaxonomyFields({ data })).toBe(data);
  });

  it('should fill the taxonomy code from the specialty and clear the subspecialty', () => {
    expect(
      resolveCompanyTaxonomyFields({
        data: { specialty: 'PSYCHIATRY' },
        existing: {
          specialty: 'INTERNAL_MEDICINE',
          subspecialty: 'CARDIOVASCULAR_DISEASE',
        },
      }),
    ).toEqual({
      specialty: 'PSYCHIATRY',
      subspecialty: null,
      taxonomyCode: '2084P0800X',
    });
  });

  it('should prefer the subspecialty code and imply Internal Medicine', () => {
    expect(
      resolveCompanyTaxonomyFields({
        data: { subspecialty: 'CARDIOVASCULAR_DISEASE' },
      }),
    ).toEqual({
      specialty: 'INTERNAL_MEDICINE',
      subspecialty: 'CARDIOVASCULAR_DISEASE',
      taxonomyCode: '207RC0000X',
    });
  });

  it('should fall back to the Internal Medicine code when the subspecialty is cleared', () => {
    expect(
      resolveCompanyTaxonomyFields({
        data: { subspecialty: null },
        existing: {
          specialty: 'INTERNAL_MEDICINE',
          subspecialty: 'CARDIOVASCULAR_DISEASE',
        },
      }),
    ).toEqual({
      specialty: 'INTERNAL_MEDICINE',
      subspecialty: null,
      taxonomyCode: '207R00000X',
    });
  });

  it('should keep the stored subspecialty when Internal Medicine is sent again', () => {
    expect(
      resolveCompanyTaxonomyFields({
        data: { specialty: 'INTERNAL_MEDICINE' },
        existing: {
          specialty: 'INTERNAL_MEDICINE',
          subspecialty: 'CARDIOVASCULAR_DISEASE',
        },
      }),
    ).toEqual({
      specialty: 'INTERNAL_MEDICINE',
      subspecialty: 'CARDIOVASCULAR_DISEASE',
      taxonomyCode: '207RC0000X',
    });
  });

  it('should clear every field when the specialty is cleared', () => {
    expect(resolveCompanyTaxonomyFields({ data: { specialty: null } })).toEqual(
      { specialty: null, subspecialty: null, taxonomyCode: null },
    );
  });

  it('should not guess when only the subspecialty is cleared without the stored record', () => {
    expect(
      resolveCompanyTaxonomyFields({ data: { subspecialty: null } }),
    ).toEqual({ subspecialty: null });
  });
});
