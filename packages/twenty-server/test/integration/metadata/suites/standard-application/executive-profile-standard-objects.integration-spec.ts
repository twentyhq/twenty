import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { findManyObjectMetadataWithIndexes } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata-with-indexes.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType } from 'twenty-shared/types';

const EXECUTIVE_OBJECT_NAMES_SINGULAR = [
  'executiveProfile',
  'executiveCareerExperience',
  'executiveEducation',
  'executiveBoardService',
  'executiveCapability',
  'executiveLanguage',
  'executiveArtifact',
  'executiveAward',
  'executiveExternalProfile',
  'executiveSearchPreference',
] as const;

// Map object name singular to its expected field names (custom fields only, no system fields)
const EXPECTED_FIELDS: Record<
  string,
  { name: string; type: FieldMetadataType }[]
> = {
  executiveProfile: [
    { name: 'person', type: FieldMetadataType.RELATION },
    { name: 'headline', type: FieldMetadataType.TEXT },
    { name: 'summary', type: FieldMetadataType.RICH_TEXT },
    { name: 'profileStatus', type: FieldMetadataType.SELECT },
    { name: 'yearsOfExperience', type: FieldMetadataType.NUMBER },
    { name: 'currentTitle', type: FieldMetadataType.TEXT },
    { name: 'location', type: FieldMetadataType.TEXT },
    { name: 'isBoardReady', type: FieldMetadataType.BOOLEAN },
    { name: 'lastVerifiedAt', type: FieldMetadataType.DATE_TIME },
    { name: 'careerExperiences', type: FieldMetadataType.RELATION },
    { name: 'educations', type: FieldMetadataType.RELATION },
    { name: 'boardServices', type: FieldMetadataType.RELATION },
    { name: 'capabilities', type: FieldMetadataType.RELATION },
    { name: 'languages', type: FieldMetadataType.RELATION },
    { name: 'artifacts', type: FieldMetadataType.RELATION },
    { name: 'awards', type: FieldMetadataType.RELATION },
    { name: 'externalProfiles', type: FieldMetadataType.RELATION },
    { name: 'searchPreferences', type: FieldMetadataType.RELATION },
  ],
  executiveCareerExperience: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'company', type: FieldMetadataType.TEXT },
    { name: 'title', type: FieldMetadataType.TEXT },
    { name: 'startDate', type: FieldMetadataType.DATE },
    { name: 'endDate', type: FieldMetadataType.DATE },
    { name: 'isCurrent', type: FieldMetadataType.BOOLEAN },
    { name: 'employmentType', type: FieldMetadataType.SELECT },
    { name: 'industry', type: FieldMetadataType.TEXT },
    { name: 'description', type: FieldMetadataType.RICH_TEXT },
  ],
  executiveEducation: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'institution', type: FieldMetadataType.TEXT },
    { name: 'degree', type: FieldMetadataType.TEXT },
    { name: 'fieldOfStudy', type: FieldMetadataType.TEXT },
    { name: 'startDate', type: FieldMetadataType.DATE },
    { name: 'endDate', type: FieldMetadataType.DATE },
    { name: 'isVerified', type: FieldMetadataType.BOOLEAN },
  ],
  executiveBoardService: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'companyName', type: FieldMetadataType.TEXT },
    { name: 'ticker', type: FieldMetadataType.TEXT },
    { name: 'role', type: FieldMetadataType.TEXT },
    { name: 'boardType', type: FieldMetadataType.SELECT },
    { name: 'startDate', type: FieldMetadataType.DATE },
    { name: 'endDate', type: FieldMetadataType.DATE },
    { name: 'isCurrent', type: FieldMetadataType.BOOLEAN },
    { name: 'isIndependent', type: FieldMetadataType.BOOLEAN },
    { name: 'committees', type: FieldMetadataType.TEXT },
  ],
  executiveCapability: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'name', type: FieldMetadataType.TEXT },
    { name: 'category', type: FieldMetadataType.SELECT },
    { name: 'proficiencyLevel', type: FieldMetadataType.SELECT },
    { name: 'source', type: FieldMetadataType.SELECT },
  ],
  executiveLanguage: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'language', type: FieldMetadataType.TEXT },
    { name: 'proficiency', type: FieldMetadataType.SELECT },
  ],
  executiveArtifact: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'type', type: FieldMetadataType.SELECT },
    { name: 'title', type: FieldMetadataType.TEXT },
    { name: 'description', type: FieldMetadataType.TEXT },
    { name: 'file', type: FieldMetadataType.RAW_JSON },
    { name: 'externalUrl', type: FieldMetadataType.TEXT },
    { name: 'sourceHash', type: FieldMetadataType.TEXT },
    { name: 'version', type: FieldMetadataType.NUMBER },
    { name: 'visibility', type: FieldMetadataType.SELECT },
    { name: 'sourceUpdatedAt', type: FieldMetadataType.DATE_TIME },
  ],
  executiveAward: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'title', type: FieldMetadataType.TEXT },
    { name: 'issuer', type: FieldMetadataType.TEXT },
    { name: 'dateReceived', type: FieldMetadataType.DATE },
    { name: 'description', type: FieldMetadataType.TEXT },
  ],
  executiveExternalProfile: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'platform', type: FieldMetadataType.SELECT },
    { name: 'url', type: FieldMetadataType.TEXT },
    { name: 'handle', type: FieldMetadataType.TEXT },
  ],
  executiveSearchPreference: [
    { name: 'executiveProfile', type: FieldMetadataType.RELATION },
    { name: 'boardTypes', type: FieldMetadataType.MULTI_SELECT },
    { name: 'industries', type: FieldMetadataType.MULTI_SELECT },
    { name: 'companySizes', type: FieldMetadataType.MULTI_SELECT },
    { name: 'preferredLocations', type: FieldMetadataType.TEXT },
    { name: 'openToRelocation', type: FieldMetadataType.BOOLEAN },
    { name: 'travelWillingness', type: FieldMetadataType.SELECT },
    { name: 'availability', type: FieldMetadataType.SELECT },
    { name: 'compensationExpectation', type: FieldMetadataType.TEXT },
    { name: 'notes', type: FieldMetadataType.RICH_TEXT },
  ],
};

describe('Executive profile standard objects metadata sync', () => {
  describe('object metadata', () => {
    it('all 10 executive objects are present with correct names and UIDs', async () => {
      const { objects } = await findManyObjectMetadata({
        expectToFail: false,
        input: {
          filter: {},
          paging: { first: 100 },
        },
        gqlFields: `
          id
          nameSingular
          namePlural
          universalIdentifier
          labelSingular
          labelPlural
          isSystem
          isCustom
        `,
      });

      // Filter executive objects
      const executiveObjects = objects.filter((obj) =>
        EXECUTIVE_OBJECT_NAMES_SINGULAR.includes(
          obj.nameSingular as (typeof EXECUTIVE_OBJECT_NAMES_SINGULAR)[number],
        ),
      );

      expect(executiveObjects.length).toBe(
        EXECUTIVE_OBJECT_NAMES_SINGULAR.length,
      );

      for (const nameSingular of EXECUTIVE_OBJECT_NAMES_SINGULAR) {
        const obj = executiveObjects.find(
          (o) => o.nameSingular === nameSingular,
        );

        jestExpectToBeDefined(obj);
        expect(obj.universalIdentifier).toBe(
          STANDARD_OBJECTS[nameSingular].universalIdentifier,
        );
        expect(obj.isSystem).toBe(true);
        expect(obj.isCustom).toBe(false);
      }
    });
  });

  describe('field metadata', () => {
    it('each object has the expected fields with correct types', async () => {
      const objects = await findManyObjectMetadataWithIndexes({
        expectToFail: false,
      });

      for (const nameSingular of EXECUTIVE_OBJECT_NAMES_SINGULAR) {
        const obj = objects.find((o) => o.nameSingular === nameSingular);

        jestExpectToBeDefined(obj);

        const expectedFields = EXPECTED_FIELDS[nameSingular];
        jestExpectToBeDefined(expectedFields);

        for (const expectedField of expectedFields) {
          const actualField = obj.fieldsList.find(
            (f) => f.name === expectedField.name,
          );

          jestExpectToBeDefined(actualField);
          expect(actualField.type).toBe(expectedField.type);
        }
      }
    });
  });

  describe('relation resolution', () => {
    it('verifies the person relation on executiveProfile resolves to the person object', async () => {
      const objects = await findManyObjectMetadataWithIndexes({
        expectToFail: false,
      });

      const executiveProfileObj = objects.find(
        (o) => o.nameSingular === 'executiveProfile',
      );

      jestExpectToBeDefined(executiveProfileObj);

      const personField = executiveProfileObj.fieldsList.find(
        (f) => f.name === 'person',
      );

      jestExpectToBeDefined(personField);
      expect(personField.relation).toBeDefined();
      expect(personField.relation?.targetObjectMetadata?.nameSingular).toBe(
        'person',
      );
    });

    it('verifies executiveProfile relations on child objects resolve correctly', async () => {
      const objects = await findManyObjectMetadataWithIndexes({
        expectToFail: false,
      });

      const childObjectNames = [
        'executiveCareerExperience',
        'executiveEducation',
        'executiveBoardService',
        'executiveCapability',
        'executiveLanguage',
        'executiveArtifact',
        'executiveAward',
        'executiveExternalProfile',
        'executiveSearchPreference',
      ];

      for (const childName of childObjectNames) {
        const childObj = objects.find((o) => o.nameSingular === childName);

        jestExpectToBeDefined(childObj);

        const executiveProfileField = childObj.fieldsList.find(
          (f) => f.name === 'executiveProfile',
        );

        jestExpectToBeDefined(executiveProfileField);
        expect(executiveProfileField.type).toBe(FieldMetadataType.RELATION);
        expect(executiveProfileField.relation).toBeDefined();
        expect(
          executiveProfileField.relation?.targetObjectMetadata?.nameSingular,
        ).toBe('executiveProfile');
      }
    });
  });
});
