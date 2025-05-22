import { v4 as uuidv4 } from 'uuid';

import { FieldActorSource } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';

export const companyPrefillData = async (
  entityManager: WorkspaceEntityManager,
  schemaName: string,
) => {
  const companies = [
    { name: 'Banco PAN', domain: 'bancopan.com.br' },
    { name: 'Banco do Brasil', domain: 'bb.com.br' },
    { name: 'Bradesco', domain: 'bradesco.com.br' },
    { name: 'Banco C6 Consignado S.A.', domain: 'c6bank.com.br' },
    { name: 'Banco Inter', domain: 'bancointer.com.br' },
    {
      name: 'Banco BNP Paribas (anteriormente Cetelem)',
      domain: 'bnpparibas.com.br',
    },
    { name: 'Banco Cooperativo Sicoob S.A.', domain: 'sicoob.com.br' },
    { name: 'Banco BMG S.A.', domain: 'bancobmg.com.br' },
    { name: 'Caixa Econômica Federal', domain: 'caixa.gov.br' },
    { name: 'Itaú Unibanco S.A.', domain: 'itau.com.br' },
    { name: 'Banco Safra S.A.', domain: 'safra.com.br' },
    { name: 'Banco Agibank S.A.', domain: 'agibank.com.br' },
    {
      name: 'Banco Bari de Investimentos e Financiamentos S.A.',
      domain: 'banconb.com.br',
    },
    { name: 'Banco BTG Pactual S.A.', domain: 'btgpactual.com' },
    { name: 'Banco Cooperativo Sicredi S.A.', domain: 'sicredi.com.br' },
    { name: 'Banco Daycoval S.A.', domain: 'daycoval.com.br' },
    { name: 'Banco Digio S.A.', domain: 'digio.com.br' },
    {
      name: 'Banco do Estado do Rio Grande do Sul S.A. (Banrisul)',
      domain: 'banrisul.com.br',
    },
    { name: 'Banco Inbursa S.A.', domain: 'inbursa.com.br' },
    { name: 'Banco Master S.A.', domain: 'bancomaster.com.br' },
    { name: 'Banco Mercantil do Brasil S.A.', domain: 'mercantil.com.br' },
    { name: 'Banco Paulista S.A.', domain: 'bancopaulista.com.br' },
    { name: 'Banco Pine S.A.', domain: 'bancopine.com.br' },
    { name: 'Banco Ribeirão Preto S.A.', domain: 'bancorp.com.br' },
    { name: 'Banco Santander (Brasil) S.A.', domain: 'santander.com.br' },
    { name: 'Banco Votorantim S.A.', domain: 'bancovotorantim.com.br' },
    { name: 'Banco VR S.A.', domain: 'bancovr.com' },
    {
      name: 'Banestes S.A. – Banco do Estado do Espírito Santo',
      domain: 'banestes.com.br',
    },
    {
      name: 'Novo Banco Continental S.A. – Banco Múltiplo',
      domain: 'nbc.com.br',
    },
    { name: 'PicPay Bank – Banco Múltiplo S.A.', domain: 'picpay.com' },
  ];

  const companyValues = companies.map((company, index) => ({
    id: uuidv4(),
    name: company.name,
    domainNamePrimaryLinkUrl: company.domain
      ? `https://${company.domain}`
      : null,
    addressAddressStreet1: null,
    addressAddressStreet2: null,
    addressAddressCity: null,
    addressAddressState: null,
    addressAddressPostcode: null,
    addressAddressCountry: 'Brasil',
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
