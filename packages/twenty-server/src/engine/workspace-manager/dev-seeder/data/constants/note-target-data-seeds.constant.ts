import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { NOTE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/note-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';

type NoteTargetDataSeed = {
  id: string;
  noteId: string | null;
  personId: string | null;
  companyId: string | null;
  opportunityId: string | null;
};

export const NOTE_TARGET_DATA_SEED_COLUMNS: (keyof NoteTargetDataSeed)[] = [
  'id',
  'noteId',
  'personId',
  'companyId',
  'opportunityId',
];

// Generate all note target IDs
const GENERATE_NOTE_TARGET_IDS = (): Record<string, string> => {
  const NOTE_TARGET_IDS: Record<string, string> = {};

  // Person note targets (ID_1 to ID_1200)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    NOTE_TARGET_IDS[`ID_${INDEX}`] =
      `40404040-${HEX_INDEX}-4e7c-8001-123456789def`;
  }

  // Company note targets (ID_1201 to ID_1800)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const HEX_INDEX = INDEX.toString(16).padStart(4, '0');

    NOTE_TARGET_IDS[`ID_${INDEX}`] =
      `40404040-${HEX_INDEX}-4e7c-9001-123456789def`;
  }

  return NOTE_TARGET_IDS;
};

const NOTE_TARGET_DATA_SEED_IDS = GENERATE_NOTE_TARGET_IDS();

// Generate note target data seeds
const GENERATE_NOTE_TARGET_SEEDS = (): NoteTargetDataSeed[] => {
  const NOTE_TARGET_SEEDS: NoteTargetDataSeed[] = [];

  // Person note targets (link each person note to its corresponding person)
  for (let INDEX = 1; INDEX <= 1200; INDEX++) {
    NOTE_TARGET_SEEDS.push({
      id: NOTE_TARGET_DATA_SEED_IDS[`ID_${INDEX}`],
      noteId: NOTE_DATA_SEED_IDS[`ID_${INDEX}`],
      personId:
        PERSON_DATA_SEED_IDS[
          `ID_${INDEX}` as keyof typeof PERSON_DATA_SEED_IDS
        ],
      companyId: null,
      opportunityId: null,
    });
  }

  // Company note targets (link each company note to its corresponding company)
  for (let INDEX = 1201; INDEX <= 1800; INDEX++) {
    const COMPANY_INDEX = INDEX - 1200;

    NOTE_TARGET_SEEDS.push({
      id: NOTE_TARGET_DATA_SEED_IDS[`ID_${INDEX}`],
      noteId: NOTE_DATA_SEED_IDS[`ID_${INDEX}`],
      personId: null,
      companyId:
        COMPANY_DATA_SEED_IDS[
          `ID_${COMPANY_INDEX}` as keyof typeof COMPANY_DATA_SEED_IDS
        ],
      opportunityId: null,
    });
  }

  return NOTE_TARGET_SEEDS;
};

export const NOTE_TARGET_DATA_SEEDS = GENERATE_NOTE_TARGET_SEEDS();
