import { v4 as uuidv4 } from 'uuid';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const companyPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const companies = [
    { name: 'Banco PAN' },
    { name: 'Banco do Brasil' },
    { name: 'Bradesco' },
    { name: 'Banco C6 Consignado S.A.' },
    { name: 'Banco Inter' },
    { name: 'Banco BNP Paribas (anteriormente Cetelem)' },
    { name: 'Banco Cooperativo Sicoob S.A.' },
    { name: 'Banco BMG S.A.' },
    { name: 'Caixa Econômica Federal' },
    { name: 'Itaú Unibanco S.A.' },
    { name: 'Banco Safra S.A.' },
    { name: 'Banco Agibank S.A.' },
    { name: 'Banco Bari de Investimentos e Financiamentos S.A.' },
    { name: 'Banco BTG Pactual S.A.' },
    { name: 'Banco Cooperativo Sicredi S.A.' },
    { name: 'Banco Daycoval S.A.' },
    { name: 'Banco Digio S.A.' },
    { name: 'Banco do Estado do Rio Grande do Sul S.A. (Banrisul)' },
    { name: 'Banco Inbursa S.A.' },
    { name: 'Banco Master S.A.' },
    { name: 'Banco Mercantil do Brasil S.A.' },
    { name: 'Banco Paulista S.A.' },
    { name: 'Banco Pine S.A.' },
    { name: 'Banco Ribeirão Preto S.A.' },
    { name: 'Banco Santander (Brasil) S.A.' },
    { name: 'Banco Votorantim S.A.' },
    { name: 'Banco VR S.A.' },
    { name: 'Banestes S.A. – Banco do Estado do Espírito Santo' },
    { name: 'Novo Banco Continental S.A. – Banco Múltiplo' },
    { name: 'PicPay Bank – Banco Múltiplo S.A.' },
  ];

  const companyValues = companies.map((company, index) => ({
    id: uuidv4(),
    name: company.name,
    domainNamePrimaryLinkUrl: null,
    addressAddressStreet1: null,
    addressAddressStreet2: null,
    addressAddressCity: null,
    addressAddressState: null,
    addressAddressPostcode: null,
    addressAddressCountry: 'Brasil',
    employees: null,
    position: index + 1,
    createdBySource: FieldActorSource.SYSTEM,
    createdByWorkspaceMemberId: null,
    createdByName: 'System',
  }));

  await entityManager
    .createQueryBuilder(undefined, undefined, undefined, {
      shouldBypassPermissionChecks: true,
    })
    .insert()
    .into(`${schemaName}.company`, [
      'id',
      'name',
      'domainNamePrimaryLinkUrl',
      'addressAddressStreet1',
      'addressAddressStreet2',
      'addressAddressCity',
      'addressAddressState',
      'addressAddressPostcode',
      'addressAddressCountry',
      'employees',
      'position',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
    ])
    .orIgnore()
    .values(companyValues)
    .returning('*')
    .execute();
};
