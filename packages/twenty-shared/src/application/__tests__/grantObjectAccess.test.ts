import { type RoleManifest } from '@/application/roleManifestType';
import { computeGrantMissingLockedPermissions } from '@/application/utils/computeGrantLockedRequirement';
import {
  buildGrantRoleManifestFromObjectAccess,
  getGrantObjectAccess,
} from '@/application/utils/grantObjectAccess';
import { RecordShareAccessLevel } from '@/types/RecordShareAccessLevel';

const REQUEST: RoleManifest = {
  universalIdentifier: 'request',
  label: 'Request',
  canReadAllObjectRecords: true,
  objectPermissions: [
    { objectUniversalIdentifier: 'company', canUpdateObjectRecords: true },
  ],
};

describe('grant object access', () => {
  it('grants exactly the request when the admin changes nothing', () => {
    const grant = buildGrantRoleManifestFromObjectAccess({
      approvedRoleManifest: REQUEST,
      objectAccess: { chosenObjectUniversalIdentifiers: null, addedObjects: [] },
    });

    expect(grant.canReadAllObjectRecords).toBe(true);
    expect(
      getGrantObjectAccess({
        approvedRoleManifest: REQUEST,
        grantRoleManifest: grant,
      }),
    ).toEqual({ chosenObjectUniversalIdentifiers: null, addedObjects: [] });
  });

  it('narrows the "all objects" request to chosen objects and adds objects at a level', () => {
    const objectAccess = {
      chosenObjectUniversalIdentifiers: ['person'],
      addedObjects: [
        {
          objectUniversalIdentifier: 'opportunity',
          accessLevel: RecordShareAccessLevel.READ_WRITE as const,
        },
      ],
    };
    const grant = buildGrantRoleManifestFromObjectAccess({
      approvedRoleManifest: REQUEST,
      objectAccess,
    });

    expect(grant.canReadAllObjectRecords).toBe(false);
    expect(
      computeGrantMissingLockedPermissions({
        approvedRoleManifest: REQUEST,
        grantRoleManifest: grant,
      }),
    ).toEqual([]);
    expect(
      getGrantObjectAccess({
        approvedRoleManifest: REQUEST,
        grantRoleManifest: grant,
      }),
    ).toEqual(objectAccess);
  });
});
