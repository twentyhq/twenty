import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

// FixMe: Is this file a duplicate of src/database/typeorm-seeds/workspace/people.ts
export const personPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.person`, [
      'nameFirstName',
      'nameLastName',
      'city',
      'emailsPrimaryEmail',
      'avatarUrl',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'phonesPrimaryPhoneNumber',
      'phonesPrimaryPhoneCountryCode',
      'companyId',
      'cpf',
      'senhaInss',
      'clienteSN',
      'convenio',
      'observacoes',
    ])
    .orIgnore()
    .values([
      {
        nameFirstName: 'John',
        nameLastName: 'Doe',
        city: 'São Paulo',
        emailsPrimaryEmail: 'john.doe@example.com',
        avatarUrl: '',
        position: 1,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '11987654321',
        phonesPrimaryPhoneCountryCode: '55',
        companyId: null,
        cpf: '12345678900',
        senhaInss: 'senha123',
        clienteSN: true,
        convenio: 'INSS',
        observacoes: 'Cliente potencial',
      },
      {
        nameFirstName: 'Jane',
        nameLastName: 'Smith',
        city: 'Rio de Janeiro',
        emailsPrimaryEmail: 'jane.smith@example.com',
        avatarUrl: '',
        position: 2,
        createdBySource: FieldActorSource.SYSTEM,
        createdByWorkspaceMemberId: null,
        createdByName: 'System',
        phonesPrimaryPhoneNumber: '21998765432',
        phonesPrimaryPhoneCountryCode: '55',
        companyId: null,
        cpf: '98765432100',
        senhaInss: 'senha456',
        clienteSN: false,
        convenio: 'FGTS',
        observacoes: 'Entrar em contato próximo mês',
      },
    ])
    .returning('*')
    .execute();
};
