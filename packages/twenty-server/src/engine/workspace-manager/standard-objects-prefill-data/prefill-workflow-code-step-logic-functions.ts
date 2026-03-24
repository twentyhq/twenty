import { isDefined } from 'twenty-shared/utils';
import { v5 as uuidv5 } from 'uuid';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { LogicFunctionFromSourceService } from 'src/engine/metadata-modules/logic-function/services/logic-function-from-source.service';

const CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_LOGIC_FUNCTION_ID_NAMESPACE =
  'd41b0a2d-aa97-44dc-ad5d-89774164af27';

export const getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionIds = (
  workspaceId: string,
) => ({
  extractDomainLogicFunctionId: uuidv5(
    `${workspaceId}:create-company-when-adding-new-person:extract-domain`,
    CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_LOGIC_FUNCTION_ID_NAMESPACE,
  ),
  isPersonalEmailLogicFunctionId: uuidv5(
    `${workspaceId}:create-company-when-adding-new-person:is-personal-email`,
    CREATE_COMPANY_WHEN_ADDING_NEW_PERSON_LOGIC_FUNCTION_ID_NAMESPACE,
  ),
});

const EXTRACT_DOMAIN_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
    },
  },
  required: ['email'],
};

const IS_PERSONAL_EMAIL_TOOL_INPUT_SCHEMA = {
  type: 'object',
  properties: {
    primaryEmail: {
      type: 'string',
    },
  },
  required: ['primaryEmail'],
};

const EXTRACT_DOMAIN_LOGIC_FUNCTION_SOURCE = `const MULTI_PART_SUFFIXES = new Set([
  'ac.uk',
  'co.in',
  'co.jp',
  'co.kr',
  'co.nz',
  'co.uk',
  'co.za',
  'com.ar',
  'com.au',
  'com.br',
  'com.cn',
  'com.hk',
  'com.mx',
  'com.sg',
  'com.tr',
  'com.tw',
  'com.ua',
  'gov.uk',
  'ne.jp',
  'net.au',
  'org.au',
  'org.uk',
]);

const getRegistrableDomain = (host) => {
  const normalizedHost = host.toLowerCase().replace(/^www\\./, '');
  const parts = normalizedHost.split('.').filter(Boolean);

  if (parts.length <= 2) {
    return normalizedHost;
  }

  const lastTwo = parts.slice(-2).join('.');

  if (MULTI_PART_SUFFIXES.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }

  return lastTwo;
};

export const main = async (params) => {
  const email =
    typeof params?.email === 'string' ? params.email.trim().toLowerCase() : '';
  const domainFromEmail = email.split('@')[1] ?? '';
  const domain = domainFromEmail ? getRegistrableDomain(domainFromEmail) : '';

  return {
    url: domain ? \`https://\${domain}\` : '',
    domain,
  };
};`;

const IS_PERSONAL_EMAIL_LOGIC_FUNCTION_SOURCE = `const MULTI_PART_SUFFIXES = new Set([
  'ac.uk',
  'co.in',
  'co.jp',
  'co.kr',
  'co.nz',
  'co.uk',
  'co.za',
  'com.ar',
  'com.au',
  'com.br',
  'com.cn',
  'com.hk',
  'com.mx',
  'com.sg',
  'com.tr',
  'com.tw',
  'com.ua',
  'gov.uk',
  'ne.jp',
  'net.au',
  'org.au',
  'org.uk',
]);

const PERSONAL_EMAIL_DOMAINS = new Set([
  'aol.com',
  'att.net',
  'btinternet.com',
  'comcast.net',
  'fastmail.com',
  'free.fr',
  'gmx.com',
  'gmx.de',
  'googlemail.com',
  'hotmail.com',
  'hotmail.fr',
  'icloud.com',
  'laposte.net',
  'live.com',
  'mac.com',
  'mail.com',
  'me.com',
  'msn.com',
  'orange.fr',
  'outlook.com',
  'outlook.fr',
  'pm.me',
  'proton.me',
  'protonmail.com',
  'sfr.fr',
  'verizon.net',
  'wanadoo.fr',
  'yahoo.co.jp',
  'yahoo.co.uk',
  'yahoo.com',
  'yandex.com',
  'yandex.ru',
  'zoho.com',
  'gmail.com',
]);

const getRegistrableDomain = (host) => {
  const normalizedHost = host.toLowerCase().replace(/^www\\./, '');
  const parts = normalizedHost.split('.').filter(Boolean);

  if (parts.length <= 2) {
    return normalizedHost;
  }

  const lastTwo = parts.slice(-2).join('.');

  if (MULTI_PART_SUFFIXES.has(lastTwo) && parts.length >= 3) {
    return parts.slice(-3).join('.');
  }

  return lastTwo;
};

export const main = async (params) => {
  const email =
    typeof params?.primaryEmail === 'string'
      ? params.primaryEmail.trim().toLowerCase()
      : '';

  if (!email || !email.includes('@')) {
    return { isPersonal: true };
  }

  const host = email.split('@')[1] ?? '';
  const registrableDomain = host ? getRegistrableDomain(host) : '';

  return {
    isPersonal:
      !registrableDomain ||
      PERSONAL_EMAIL_DOMAINS.has(host) ||
      PERSONAL_EMAIL_DOMAINS.has(registrableDomain),
  };
};`;

export const ensureCreateCompanyWhenAddingNewPersonCodeStepLogicFunctions =
  async ({
    workspaceId,
    logicFunctionFromSourceService,
    flatEntityMapsCacheService,
  }: {
    workspaceId: string;
    logicFunctionFromSourceService: LogicFunctionFromSourceService;
    flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService;
  }) => {
    const { extractDomainLogicFunctionId, isPersonalEmailLogicFunctionId } =
      getCreateCompanyWhenAddingNewPersonCodeStepLogicFunctionIds(workspaceId);

    const { flatLogicFunctionMaps } =
      await flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
        workspaceId,
        flatMapsKeys: ['flatLogicFunctionMaps'],
      });

    if (
      !isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatLogicFunctionMaps,
          flatEntityId: extractDomainLogicFunctionId,
        }),
      )
    ) {
      await logicFunctionFromSourceService.createOneFromSource({
        workspaceId,
        input: {
          id: extractDomainLogicFunctionId,
          name: 'Extract domain from email',
          description:
            'Extracts a normalized company domain and URL from a person email address.',
          source: {
            handlerName: 'main',
            sourceHandlerCode: EXTRACT_DOMAIN_LOGIC_FUNCTION_SOURCE,
            toolInputSchema: EXTRACT_DOMAIN_TOOL_INPUT_SCHEMA,
          },
        },
      });
    }

    if (
      !isDefined(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityMaps: flatLogicFunctionMaps,
          flatEntityId: isPersonalEmailLogicFunctionId,
        }),
      )
    ) {
      await logicFunctionFromSourceService.createOneFromSource({
        workspaceId,
        input: {
          id: isPersonalEmailLogicFunctionId,
          name: 'Is this a personal email?',
          description:
            'Detects whether an email address belongs to a common personal email provider.',
          source: {
            handlerName: 'main',
            sourceHandlerCode: IS_PERSONAL_EMAIL_LOGIC_FUNCTION_SOURCE,
            toolInputSchema: IS_PERSONAL_EMAIL_TOOL_INPUT_SCHEMA,
          },
        },
      });
    }
  };
