import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const PROGRESSIVE_ID = 'c776ee49-f608-4a77-8cc8-6fe96ae1e43f';
export const STATE_FARM_ID = 'f45ee421-8a3e-4aa5-a1cf-7207cc6754e1';
export const GEICO_ID = '1f70157c-4ea5-4d81-bc49-e1401abfbb94';
export const ALLSTATE_ID = '9d5bcf43-7d38-4e88-82cb-d6d4ce638bf0';
export const LIBERTY_MUTUAL_ID = '06290608-8bf0-4806-99ae-a715a6a93fad';

export const carrierPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.carrier`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'location',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values([
      {
        id: PROGRESSIVE_ID,
        name: 'Progressive',
        domainNamePrimaryLinkUrl: 'https://progressive.com',
        location: 'Mayfield Village, Ohio',
        position: 0,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: STATE_FARM_ID,
        name: 'State Farm',
        domainNamePrimaryLinkUrl: 'https://statefarm.com',
        location: 'Bloomington, Illinois',
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: GEICO_ID,
        name: 'GEICO',
        domainNamePrimaryLinkUrl: 'https://geico.com',
        location: 'Chevy Chase, Maryland',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: ALLSTATE_ID,
        name: 'Allstate',
        domainNamePrimaryLinkUrl: 'https://allstate.com',
        location: 'Northfield Township, Illinois',
        position: 3,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
      {
        id: LIBERTY_MUTUAL_ID,
        name: 'Liberty Mutual',
        domainNamePrimaryLinkUrl: 'https://libertymutual.com',
        location: 'Boston, Massachusetts',
        position: 4,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
      },
    ])
    .returning('*')
    .execute();
};
