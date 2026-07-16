import {
  getFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

const EXECUTIVE_OBJECT_NAMES = [
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

const SYSTEM_FIELD_NAMES = [
  'id',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
] as const;

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

describe('Executive object identifiers determinism', () => {
  describe('object universal identifiers', () => {
    it('each of the 10 objects has a valid UUID v4 universalIdentifier', () => {
      for (const name of EXECUTIVE_OBJECT_NAMES) {
        const obj = STANDARD_OBJECTS[name];
        expect(obj).toBeDefined();
        expect(obj.universalIdentifier).toMatch(UUID_V4_REGEX);
      }
    });

    it('all 10 object universal identifiers are unique (no collisions)', () => {
      const uids = EXECUTIVE_OBJECT_NAMES.map(
        (name) => STANDARD_OBJECTS[name].universalIdentifier,
      );
      const uniqueUids = new Set(uids);

      expect(uniqueUids.size).toBe(EXECUTIVE_OBJECT_NAMES.length);
    });
  });

  describe('field universal identifiers', () => {
    it('for each object, all custom-field UIDs are unique within the object', () => {
      for (const name of EXECUTIVE_OBJECT_NAMES) {
        const obj = STANDARD_OBJECTS[name];
        const fieldUids = Object.values(obj.fields).map(
          (field: { universalIdentifier: string }) => field.universalIdentifier,
        );
        const uniqueFieldUids = new Set(fieldUids);

        expect(uniqueFieldUids.size).toBe(fieldUids.length);
      }
    });

    it('no custom-field UID collisions across objects', () => {
      const allFieldUids: string[] = [];

      for (const name of EXECUTIVE_OBJECT_NAMES) {
        const obj = STANDARD_OBJECTS[name];
        const fieldUids = Object.values(obj.fields).map(
          (field: { universalIdentifier: string }) => field.universalIdentifier,
        );

        allFieldUids.push(...fieldUids);
      }

      const uniqueFieldUids = new Set(allFieldUids);

      expect(uniqueFieldUids.size).toBe(allFieldUids.length);
    });

    it('system-field UIDs match UUID-v5 derivation', () => {
      for (const name of EXECUTIVE_OBJECT_NAMES) {
        const obj = STANDARD_OBJECTS[name];

        for (const fieldName of SYSTEM_FIELD_NAMES) {
          const expectedUid = getFieldUniversalIdentifier({
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
            objectUniversalIdentifier: obj.universalIdentifier,
            name: fieldName,
          });

          expect(obj.fields[fieldName]).toBeDefined();
          expect(obj.fields[fieldName].universalIdentifier).toBe(expectedUid);
        }
      }
    });
  });

  describe('executiveProfile specific assertions', () => {
    it('the person relation exists on executiveProfile', () => {
      const executiveProfile = STANDARD_OBJECTS.executiveProfile;

      expect(executiveProfile.fields.person).toBeDefined();
      expect(executiveProfile.fields.person.universalIdentifier).toMatch(
        UUID_V4_REGEX,
      );
    });

    it('executiveProfile has a personIdUniqueIndex index', () => {
      const executiveProfile = STANDARD_OBJECTS.executiveProfile;

      expect(executiveProfile.indexes.personIdUniqueIndex).toBeDefined();
      expect(
        executiveProfile.indexes.personIdUniqueIndex.universalIdentifier,
      ).toMatch(UUID_V4_REGEX);
    });
  });
});
