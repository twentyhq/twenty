import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { PET_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/pet-data-seeds.constant';

type PetCareAgreementDataSeed = {
  id: string;
  petId: string;
  // Morph relation creates separate columns for each target type
  caretakerPersonId: string | null;
  caretakerCompanyId: string | null;
};

export const PET_CARE_AGREEMENT_DATA_SEED_COLUMNS: (keyof PetCareAgreementDataSeed)[] =
  ['id', 'petId', 'caretakerPersonId', 'caretakerCompanyId'];

export const PET_CARE_AGREEMENT_DATA_SEED_IDS = {
  ID_1: '20202020-c001-4000-8000-000000000001',
  ID_2: '20202020-c001-4000-8000-000000000002',
  ID_3: '20202020-c001-4000-8000-000000000003',
};

// Sample pet care agreements: Toby the pet has multiple caretakers (both persons and companies)
export const PET_CARE_AGREEMENT_DATA_SEEDS: PetCareAgreementDataSeed[] = [
  // Toby is cared for by Mark Young (Person 1)
  {
    id: PET_CARE_AGREEMENT_DATA_SEED_IDS.ID_1,
    petId: PET_DATA_SEED_IDS.ID_1,
    caretakerPersonId: PERSON_DATA_SEED_IDS.ID_1,
    caretakerCompanyId: null,
  },
  // Toby is also cared for by Gabriel Robinson (Person 2)
  {
    id: PET_CARE_AGREEMENT_DATA_SEED_IDS.ID_2,
    petId: PET_DATA_SEED_IDS.ID_1,
    caretakerPersonId: PERSON_DATA_SEED_IDS.ID_2,
    caretakerCompanyId: null,
  },
  // Toby is also cared for by Company 1 (a pet care service company)
  {
    id: PET_CARE_AGREEMENT_DATA_SEED_IDS.ID_3,
    petId: PET_DATA_SEED_IDS.ID_1,
    caretakerPersonId: null,
    caretakerCompanyId: COMPANY_DATA_SEED_IDS.ID_1,
  },
];
