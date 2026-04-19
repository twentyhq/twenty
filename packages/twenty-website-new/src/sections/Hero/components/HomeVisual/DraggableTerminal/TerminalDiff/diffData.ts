// Diff data shown in the slide-in review panel. Reflects the launch-ops CRM
// expansion (Rocket, Launch, Payload, Customer, Launch site) that the chat
// scaffolds — matches the file list in ChangesSummaryCard.

import { CHANGESET_TOTALS } from '../conversation/rocketChangeset';

export type DiffTokenKind =
  | 'text'
  | 'keyword'
  | 'type'
  | 'string'
  | 'identifier';

export type DiffToken = { kind: DiffTokenKind; value: string };

export type DiffChunk =
  | {
      kind: 'line';
      lineNumber: number;
      tokens: DiffToken[];
      change?: 'added' | 'removed';
    }
  | { kind: 'unmodified'; count: number };

export type DiffFile = {
  id: string;
  path: string;
  added: number;
  removed: number;
  chunks: DiffChunk[];
};

const kw = (value: string): DiffToken => ({ kind: 'keyword', value });
const ty = (value: string): DiffToken => ({ kind: 'type', value });
const st = (value: string): DiffToken => ({ kind: 'string', value });
const id = (value: string): DiffToken => ({ kind: 'identifier', value });
const tx = (value: string): DiffToken => ({ kind: 'text', value });

export const DIFF_FILES: DiffFile[] = [
  {
    id: 'schema-identifiers',
    path: '…my-twenty-app/src/constants/schema-identifiers.ts',
    added: 84,
    removed: 0,
    chunks: [
      {
        kind: 'line',
        lineNumber: 1,
        change: 'added',
        tokens: [
          kw('export'),
          tx(' '),
          kw('const'),
          tx(' '),
          id('SCHEMA_IDS'),
          tx(' = {'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 2,
        change: 'added',
        tokens: [
          tx('  rocket: { object: '),
          st("'733956fd-…'"),
          tx(', fields: { '),
          id('launches'),
          tx(': '),
          st("'5b877c2a-…'"),
          tx(' } },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 3,
        change: 'added',
        tokens: [
          tx('  launch: { object: '),
          st("'e7f1e750-…'"),
          tx(', fields: { '),
          id('rocket'),
          tx(': '),
          st("'42c9106f-…'"),
          tx(' } },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 4,
        change: 'added',
        tokens: [
          tx('  payload: { object: '),
          st("'16ffcc45-…'"),
          tx(', fields: { '),
          id('customer'),
          tx(': '),
          st("'d84468aa-…'"),
          tx(' } },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 5,
        change: 'added',
        tokens: [
          tx('  launchSite: { object: '),
          st("'2f18d525-…'"),
          tx(', fields: { '),
          id('launches'),
          tx(': '),
          st("'b94b7f00-…'"),
          tx(' } },'),
        ],
      },
      { kind: 'unmodified', count: 79 },
    ],
  },
  {
    id: 'launch-object',
    path: '…my-twenty-app/src/objects/launch.object.ts',
    added: 237,
    removed: 0,
    chunks: [
      {
        kind: 'line',
        lineNumber: 1,
        change: 'added',
        tokens: [
          kw('import'),
          tx(' { '),
          id('defineObject'),
          tx(', '),
          id('FieldType'),
          tx(', '),
          id('RelationType'),
          tx(' } '),
          kw('from'),
          tx(' '),
          st("'twenty-sdk'"),
          tx(';'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 3,
        change: 'added',
        tokens: [
          kw('export'),
          tx(' '),
          kw('default'),
          tx(' '),
          id('defineObject'),
          tx('({'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 4,
        change: 'added',
        tokens: [tx('  nameSingular: '), st("'launch'"), tx(',')],
      },
      {
        kind: 'line',
        lineNumber: 5,
        change: 'added',
        tokens: [
          tx('  labelSingular: '),
          st("'Launch'"),
          tx(', labelPlural: '),
          st("'Launches'"),
          tx(','),
        ],
      },
      {
        kind: 'line',
        lineNumber: 6,
        change: 'added',
        tokens: [tx('  icon: '), st("'IconRocket'"), tx(',')],
      },
      {
        kind: 'line',
        lineNumber: 7,
        change: 'added',
        tokens: [tx('  fields: [')],
      },
      {
        kind: 'line',
        lineNumber: 8,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'missionCode'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('TEXT'),
          tx(', isUnique: '),
          kw('true'),
          tx(' },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 9,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'status'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('SELECT'),
          tx(', options: [ … ] },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 10,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'plannedLaunchAt'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('DATE_TIME'),
          tx(' },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 11,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'rocket'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('RELATION'),
          tx(', relationType: '),
          id('RelationType'),
          tx('.'),
          ty('MANY_TO_ONE'),
          tx(' },'),
        ],
      },
      { kind: 'unmodified', count: 226 },
    ],
  },
  {
    id: 'payload-object',
    path: '…my-twenty-app/src/objects/payload.object.ts',
    added: 198,
    removed: 0,
    chunks: [
      {
        kind: 'line',
        lineNumber: 1,
        change: 'added',
        tokens: [
          kw('import'),
          tx(' { '),
          id('STANDARD_OBJECT'),
          tx(' } '),
          kw('from'),
          tx(' '),
          st("'twenty-sdk'"),
          tx(';'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 4,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'payloadType'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('SELECT'),
          tx(' },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 5,
        change: 'added',
        tokens: [
          tx('    { name: '),
          st("'customer'"),
          tx(', type: '),
          id('FieldType'),
          tx('.'),
          ty('RELATION'),
          tx(','),
        ],
      },
      {
        kind: 'line',
        lineNumber: 6,
        change: 'added',
        tokens: [
          tx('      relationTargetObjectMetadataUniversalIdentifier: '),
          id('STANDARD_OBJECT'),
          tx('.company.universalIdentifier,'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 7,
        change: 'added',
        tokens: [
          tx('      universalSettings: { relationType: '),
          id('RelationType'),
          tx('.'),
          ty('MANY_TO_ONE'),
          tx(', joinColumnName: '),
          st("'companyId'"),
          tx(' },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 8,
        change: 'added',
        tokens: [tx('    },')],
      },
      { kind: 'unmodified', count: 190 },
    ],
  },
  {
    id: 'rocket-object',
    path: '…my-twenty-app/src/objects/rocket.object.ts',
    added: 28,
    removed: 32,
    chunks: [
      { kind: 'unmodified', count: 140 },
      {
        kind: 'line',
        lineNumber: 141,
        change: 'removed',
        tokens: [tx('  ')],
      },
      {
        kind: 'line',
        lineNumber: 141,
        change: 'added',
        tokens: [tx('    {')],
      },
      {
        kind: 'line',
        lineNumber: 142,
        change: 'added',
        tokens: [tx('      name: '), st("'launches'"), tx(',')],
      },
      {
        kind: 'line',
        lineNumber: 143,
        change: 'added',
        tokens: [
          tx('      type: '),
          id('FieldType'),
          tx('.'),
          ty('RELATION'),
          tx(','),
        ],
      },
      {
        kind: 'line',
        lineNumber: 144,
        change: 'added',
        tokens: [
          tx('      relationType: '),
          id('RelationType'),
          tx('.'),
          ty('ONE_TO_MANY'),
          tx(','),
        ],
      },
      {
        kind: 'line',
        lineNumber: 145,
        change: 'added',
        tokens: [
          tx('      relationTargetObjectMetadataUniversalIdentifier: '),
          id('SCHEMA_IDS'),
          tx('.launch.object,'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 146,
        change: 'added',
        tokens: [tx('    },')],
      },
    ],
  },
  {
    id: 'upcoming-launches-view',
    path: '…my-twenty-app/src/views/upcoming-launches.view.ts',
    added: 82,
    removed: 0,
    chunks: [
      {
        kind: 'line',
        lineNumber: 1,
        change: 'added',
        tokens: [
          kw('import'),
          tx(' { '),
          id('defineView'),
          tx(', '),
          id('ViewFilterOperand'),
          tx(', '),
          id('ViewType'),
          tx(' } '),
          kw('from'),
          tx(' '),
          st("'twenty-sdk'"),
          tx(';'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 3,
        change: 'added',
        tokens: [
          kw('export'),
          tx(' '),
          kw('default'),
          tx(' '),
          id('defineView'),
          tx('({'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 4,
        change: 'added',
        tokens: [tx('  name: '), st("'Upcoming launches'"), tx(',')],
      },
      {
        kind: 'line',
        lineNumber: 5,
        change: 'added',
        tokens: [tx('  type: '), id('ViewType'), tx('.'), ty('TABLE'), tx(',')],
      },
      {
        kind: 'line',
        lineNumber: 6,
        change: 'added',
        tokens: [tx('  filters: [')],
      },
      {
        kind: 'line',
        lineNumber: 7,
        change: 'added',
        tokens: [
          tx('    { fieldMetadataUniversalIdentifier: '),
          id('SCHEMA_IDS'),
          tx('.launch.fields.plannedLaunchAt,'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 8,
        change: 'added',
        tokens: [
          tx('      operand: '),
          id('ViewFilterOperand'),
          tx('.'),
          ty('IS_IN_FUTURE'),
          tx(' },'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 9,
        change: 'added',
        tokens: [tx('  ],')],
      },
      { kind: 'unmodified', count: 73 },
    ],
  },
  {
    id: 'schema-integration-test',
    path: '…my-twenty-app/src/__tests__/schema.integration-test.ts',
    added: 412,
    removed: 40,
    chunks: [
      { kind: 'unmodified', count: 150 },
      {
        kind: 'line',
        lineNumber: 151,
        change: 'removed',
        tokens: [
          tx('  '),
          id('expect'),
          tx('(application.objects).'),
          id('toHaveLength'),
          tx('('),
          ty('1'),
          tx(');'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 151,
        change: 'added',
        tokens: [
          tx('  '),
          id('expect'),
          tx('(application.objects).'),
          id('toHaveLength'),
          tx('('),
          ty('4'),
          tx(');'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 152,
        change: 'added',
        tokens: [
          tx('  '),
          id('expectObject'),
          tx('(application.objects, '),
          id('SCHEMA_IDS'),
          tx('.launch.object, '),
          st("'launch'"),
          tx(', '),
          st("'Launch'"),
          tx(');'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 153,
        change: 'added',
        tokens: [
          tx('  '),
          id('expectObject'),
          tx('(application.objects, '),
          id('SCHEMA_IDS'),
          tx('.payload.object, '),
          st("'payload'"),
          tx(', '),
          st("'Payload'"),
          tx(');'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 154,
        change: 'added',
        tokens: [
          tx('  '),
          id('expectObject'),
          tx('(application.objects, '),
          id('SCHEMA_IDS'),
          tx('.launchSite.object, '),
          st("'launchSite'"),
          tx(', '),
          st("'Launch site'"),
          tx(');'),
        ],
      },
      {
        kind: 'line',
        lineNumber: 155,
        change: 'added',
        tokens: [
          tx('  '),
          id('expectRelationPair'),
          tx('(payloadCustomerField, [payload.object, '),
          id('STANDARD_OBJECT'),
          tx('.company.universalIdentifier], [...]);'),
        ],
      },
      { kind: 'unmodified', count: 325 },
    ],
  },
];

// The diff panel only ships a sampler of files; the top-bar pill summarizes
// the full changeset, so derive totals from the canonical changeset to keep
// the pill consistent with the ChangesSummaryCard header.
export const DIFF_TOTALS = CHANGESET_TOTALS;
