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
  fullPath: string;
  type: string;
  fileCategory?: string;
  // Deprecated: Use createdBy instead
  authorId: string | null;
  createdBySource: string;
  createdByWorkspaceMemberId: string;
  createdByName: string;
  personId: string | null;
  companyId: string | null;
  noteId: string | null;
  taskId: string | null;
  opportunityId: string | null;
};

export const ATTACHMENT_DATA_SEED_COLUMNS: (keyof AttachmentDataSeed)[] = [
  'id',
  'name',
  'fullPath',
  'type',
  'fileCategory',
  'authorId', // Deprecated: kept for backward compatibility during migration
  'createdBySource',
  'createdByWorkspaceMemberId',
  'createdByName',
  'personId',
  'companyId',
  'noteId',
  'taskId',
  'opportunityId',
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

// Pool of 5 reusable file paths for attachments
const FILE_TEMPLATE_PATHS = [
  'attachment/sample-contract.pdf',
  'attachment/budget-2024.xlsx',
  'attachment/presentation.pptx',
  'attachment/screenshot.png',
  'attachment/archive.zip',
];

// Additional name variations for more realistic variety
const FILE_NAME_VARIATIONS = [
  // Documents
  {
    name: 'Service Agreement.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'NDA Document.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'Project Proposal.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'Invoice Q1 2024.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'Meeting Notes.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'Report Final.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  {
    name: 'Contract Signed.pdf',
    type: 'TextDocument',
    fileCategory: 'TEXT_DOCUMENT',
    pathIndex: 0,
  },
  // Spreadsheets
  {
    name: 'Financial Forecast.xlsx',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  {
    name: 'Sales Report Q4.xlsx',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  {
    name: 'Team Roster.xlsx',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  {
    name: 'Expense Report.xlsx',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  {
    name: 'Inventory List.xlsx',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  {
    name: 'Data Export.csv',
    type: 'Spreadsheet',
    fileCategory: 'SPREADSHEET',
    pathIndex: 1,
  },
  // Presentations
  {
    name: 'Pitch Deck.pptx',
    type: 'Presentation',
    fileCategory: 'PRESENTATION',
    pathIndex: 2,
  },
  {
    name: 'Q4 Results.pptx',
    type: 'Presentation',
    fileCategory: 'PRESENTATION',
    pathIndex: 2,
  },
  {
    name: 'Roadmap 2024.pptx',
    type: 'Presentation',
    fileCategory: 'PRESENTATION',
    pathIndex: 2,
  },
  {
    name: 'Company Overview.pptx',
    type: 'Presentation',
    fileCategory: 'PRESENTATION',
    pathIndex: 2,
  },
  {
    name: 'Training Materials.pptx',
    type: 'Presentation',
    fileCategory: 'PRESENTATION',
    pathIndex: 2,
  },
  // Images
  {
    name: 'Company Logo.png',
    type: 'Image',
    fileCategory: 'IMAGE',
    pathIndex: 3,
  },
  {
    name: 'Product Photo.jpg',
    type: 'Image',
    fileCategory: 'IMAGE',
    pathIndex: 3,
  },
  { name: 'Diagram.png', type: 'Image', fileCategory: 'IMAGE', pathIndex: 3 },
  { name: 'Wireframe.png', type: 'Image', fileCategory: 'IMAGE', pathIndex: 3 },
  {
    name: 'Mockup Design.png',
    type: 'Image',
    fileCategory: 'IMAGE',
    pathIndex: 3,
  },
  { name: 'Headshot.jpg', type: 'Image', fileCategory: 'IMAGE', pathIndex: 3 },
  // Archives
  {
    name: 'Project Files.zip',
    type: 'Archive',
    fileCategory: 'ARCHIVE',
    pathIndex: 4,
  },
  {
    name: 'Backup Data.zip',
    type: 'Archive',
    fileCategory: 'ARCHIVE',
    pathIndex: 4,
  },
  {
    name: 'Source Code.zip',
    type: 'Archive',
    fileCategory: 'ARCHIVE',
    pathIndex: 4,
  },
];

const GENERATE_ATTACHMENT_SEEDS = (): AttachmentDataSeed[] => {
  const ATTACHMENT_SEEDS: AttachmentDataSeed[] = [];

  // Get available entity IDs
  const PERSON_IDS = Object.values(PERSON_DATA_SEED_IDS).slice(0, 120); // Use first 120 persons
  const COMPANY_IDS = Object.values(COMPANY_DATA_SEED_IDS).slice(0, 120); // Use first 120 companies
  const NOTE_IDS = Object.values(NOTE_DATA_SEED_IDS).slice(0, 80); // Use first 80 notes
  const TASK_IDS = Object.values(TASK_DATA_SEED_IDS).slice(0, 60); // Use first 60 tasks
  const OPPORTUNITY_IDS = Object.values(OPPORTUNITY_DATA_SEED_IDS).slice(0, 20); // Use first 20 opportunities

  let entityIndex = 0;

  for (let INDEX = 1; INDEX <= 400; INDEX++) {
    // Cycle through file name variations
    const NAME_VARIATION_INDEX = INDEX % FILE_NAME_VARIATIONS.length;
    const NAME_VARIATION = FILE_NAME_VARIATIONS[NAME_VARIATION_INDEX];
    const FILE_PATH = FILE_TEMPLATE_PATHS[NAME_VARIATION.pathIndex];

    // Determine which entity this attachment belongs to
    // Distribution: ~30% person, ~30% company, ~20% note, ~15% task, ~5% opportunity
    let personId: string | null = null;
    let companyId: string | null = null;
    let noteId: string | null = null;
    let taskId: string | null = null;
    let opportunityId: string | null = null;

    const DISTRIBUTION_VALUE = INDEX % 100;

    if (DISTRIBUTION_VALUE < 30) {
      // 30% Person attachments
      personId = PERSON_IDS[entityIndex % PERSON_IDS.length];
      entityIndex++;
    } else if (DISTRIBUTION_VALUE < 60) {
      // 30% Company attachments
      companyId = COMPANY_IDS[entityIndex % COMPANY_IDS.length];
      entityIndex++;
    } else if (DISTRIBUTION_VALUE < 80) {
      // 20% Note attachments
      noteId = NOTE_IDS[entityIndex % NOTE_IDS.length];
      entityIndex++;
    } else if (DISTRIBUTION_VALUE < 95) {
      // 15% Task attachments
      taskId = TASK_IDS[entityIndex % TASK_IDS.length];
      entityIndex++;
    } else {
      // 5% Opportunity attachments
      opportunityId = OPPORTUNITY_IDS[entityIndex % OPPORTUNITY_IDS.length];
      entityIndex++;
    }

    ATTACHMENT_SEEDS.push({
      id: ATTACHMENT_DATA_SEED_IDS[`ID_${INDEX}`],
      name: NAME_VARIATION.name,
      fullPath: FILE_PATH,
      type: NAME_VARIATION.type,
      fileCategory: NAME_VARIATION.fileCategory,
      // Deprecated: Use createdBy fields instead
      authorId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdBySource: FieldActorSource.MANUAL,
      createdByWorkspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      createdByName: 'Tim A',
      personId,
      companyId,
      noteId,
      taskId,
      opportunityId,
    });
  }

  return ATTACHMENT_SEEDS;
};

export const ATTACHMENT_DATA_SEEDS = GENERATE_ATTACHMENT_SEEDS();
