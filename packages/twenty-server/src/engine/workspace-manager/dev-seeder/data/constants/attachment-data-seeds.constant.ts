import { FieldActorSource } from 'twenty-shared/types';

import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { NOTE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { OPPORTUNITY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/opportunity-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { TASK_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/task-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

type AttachmentDataSeed = {
  id: string;
  name: string;
  file: string;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  updatedBySource: string;
  updatedByWorkspaceMemberId: string;
  updatedByName: string;
  targetPersonId: string | null;
  targetCompanyId: string | null;
  targetNoteId: string | null;
  targetTaskId: string | null;
  targetOpportunityId: string | null;
};

export const ATTACHMENT_DATA_SEED_COLUMNS: (keyof AttachmentDataSeed)[] = [
  'id',
  'name',
  'file',
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'updatedBySource',
  'updatedByWorkspaceMemberId',
  'updatedByName',
  'targetPersonId',
  'targetCompanyId',
  'targetNoteId',
  'targetTaskId',
  'targetOpportunityId',
];

const GENERATE_ATTACHMENT_IDS = (): Record<string, string> => {
  const ATTACHMENT_IDS: Record<string, string> = {};

  for (let INDEX = 1; INDEX <= 400; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    ATTACHMENT_IDS[`ID_${INDEX}`] =
      `20202020-${HEX_INDEX}-4a7c-8001-123456789aba`;
  }

  return ATTACHMENT_IDS;
};

export const ATTACHMENT_DATA_SEED_IDS = GENERATE_ATTACHMENT_IDS();

// FileIds must be unique per workspace since core.file is a shared table.
// We use the first 12 hex chars of the workspaceId as a namespace suffix.
const deriveFileId = (attachmentIndex: number, workspaceId: string): string => {
  const workspaceHex = workspaceId.replace(/-/g, '').slice(0, 12);
  const hexIndex = attachmentIndex.toString(16).padStart(4, '0');

  return `f11e0000-${hexIndex}-4a7c-8001-${workspaceHex}`;
};

export const ATTACHMENT_SAMPLE_FILES = [
  {
    filename: 'sample-contract.pdf',
    mimeType: 'application/pdf',
    extension: 'pdf',
  },
  {
    filename: 'budget-2024.xlsx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    extension: 'xlsx',
  },
  {
    filename: 'presentation.pptx',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
  },
  {
    filename: 'screenshot.png',
    mimeType: 'image/png',
    extension: 'png',
  },
  {
    filename: 'archive.zip',
    mimeType: 'application/zip',
    extension: 'zip',
  },
];

const FILE_NAME_VARIATIONS = [
  // Documents
  { name: 'Service Agreement.pdf', sampleFileIndex: 0 },
  { name: 'NDA Document.pdf', sampleFileIndex: 0 },
  { name: 'Project Proposal.pdf', sampleFileIndex: 0 },
  { name: 'Invoice Q1 2024.pdf', sampleFileIndex: 0 },
  { name: 'Meeting Notes.pdf', sampleFileIndex: 0 },
  { name: 'Report Final.pdf', sampleFileIndex: 0 },
  { name: 'Contract Signed.pdf', sampleFileIndex: 0 },
  // Spreadsheets
  { name: 'Financial Forecast.xlsx', sampleFileIndex: 1 },
  { name: 'Sales Report Q4.xlsx', sampleFileIndex: 1 },
  { name: 'Team Roster.xlsx', sampleFileIndex: 1 },
  { name: 'Expense Report.xlsx', sampleFileIndex: 1 },
  { name: 'Inventory List.xlsx', sampleFileIndex: 1 },
  { name: 'Data Export.csv', sampleFileIndex: 1 },
  // Presentations
  { name: 'Pitch Deck.pptx', sampleFileIndex: 2 },
  { name: 'Q4 Results.pptx', sampleFileIndex: 2 },
  { name: 'Roadmap 2024.pptx', sampleFileIndex: 2 },
  { name: 'Company Overview.pptx', sampleFileIndex: 2 },
  { name: 'Training Materials.pptx', sampleFileIndex: 2 },
  // Images
  { name: 'Company Logo.png', sampleFileIndex: 3 },
  { name: 'Product Photo.jpg', sampleFileIndex: 3 },
  { name: 'Diagram.png', sampleFileIndex: 3 },
  { name: 'Wireframe.png', sampleFileIndex: 3 },
  { name: 'Mockup Design.png', sampleFileIndex: 3 },
  { name: 'Headshot.jpg', sampleFileIndex: 3 },
  // Archives
  { name: 'Project Files.zip', sampleFileIndex: 4 },
  { name: 'Backup Data.zip', sampleFileIndex: 4 },
  { name: 'Source Code.zip', sampleFileIndex: 4 },
];

export type AttachmentFileSeedMetadata = {
  fileId: string;
  label: string;
  sampleFileIndex: number;
  mimeType: string;
  extension: string;
};

export const generateAttachmentSeedsForWorkspace = (
  workspaceId: string,
): {
  seeds: AttachmentDataSeed[];
  fileSeedMetadata: AttachmentFileSeedMetadata[];
} => {
  const seeds: AttachmentDataSeed[] = [];
  const fileSeedMetadata: AttachmentFileSeedMetadata[] = [];

  const PERSON_IDS = Object.values(PERSON_DATA_SEED_IDS).slice(0, 120);
  const COMPANY_IDS = Object.values(COMPANY_DATA_SEED_IDS).slice(0, 120);
  const NOTE_IDS = Object.values(NOTE_DATA_SEED_IDS).slice(0, 80);
  const TASK_IDS = Object.values(TASK_DATA_SEED_IDS).slice(0, 60);
  const OPPORTUNITY_IDS = Object.values(OPPORTUNITY_DATA_SEED_IDS).slice(0, 20);

  let entityIndex = 0;

  for (let index = 1; index <= 400; index++) {
    const nameVariationIndex = index % FILE_NAME_VARIATIONS.length;
    const nameVariation = FILE_NAME_VARIATIONS[nameVariationIndex];
    const sampleFile = ATTACHMENT_SAMPLE_FILES[nameVariation.sampleFileIndex];

    const attachmentId = ATTACHMENT_DATA_SEED_IDS[`ID_${index}`];
    const fileId = deriveFileId(index, workspaceId);

    let targetPersonId: string | null = null;
    let targetCompanyId: string | null = null;
    let targetNoteId: string | null = null;
    let targetTaskId: string | null = null;
    let targetOpportunityId: string | null = null;

    const distributionValue = index % 100;

    if (distributionValue < 30) {
      targetPersonId = PERSON_IDS[entityIndex % PERSON_IDS.length];
      entityIndex++;
    } else if (distributionValue < 60) {
      targetCompanyId = COMPANY_IDS[entityIndex % COMPANY_IDS.length];
      entityIndex++;
    } else if (distributionValue < 80) {
      targetNoteId = NOTE_IDS[entityIndex % NOTE_IDS.length];
      entityIndex++;
    } else if (distributionValue < 95) {
      targetTaskId = TASK_IDS[entityIndex % TASK_IDS.length];
      entityIndex++;
    } else {
      targetOpportunityId =
        OPPORTUNITY_IDS[entityIndex % OPPORTUNITY_IDS.length];
      entityIndex++;
    }

    fileSeedMetadata.push({
      fileId,
      label: nameVariation.name,
      sampleFileIndex: nameVariation.sampleFileIndex,
      mimeType: sampleFile.mimeType,
      extension: sampleFile.extension,
    });

    seeds.push({
      id: attachmentId,
      name: nameVariation.name,
      file: JSON.stringify([
        { fileId, label: nameVariation.name, extension: sampleFile.extension },
      ]),
      createdBySource: FieldActorSource.MANUAL,
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      updatedBySource: FieldActorSource.MANUAL,
      updatedByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      updatedByName: 'Tim A',
      targetPersonId,
      targetCompanyId,
      targetNoteId,
      targetTaskId,
      targetOpportunityId,
    });
  }

  return { seeds, fileSeedMetadata };
};
