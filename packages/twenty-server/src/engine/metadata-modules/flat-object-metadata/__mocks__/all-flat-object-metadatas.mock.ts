import { ATTACHMENT_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/attachment-flat-object.mock';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { FAVORITE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/favorite-flat-object.mock';
import { FAVORITE_FOLDER_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/favorite-folder-flat-object.mock';
import { NOTE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-flat-object.mock';
import { NOTE_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-target-flat-object.mock';
import { OPPORTUNITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/opportunity-flat-object.mock';
import { PERSON_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/person-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { TASK_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-flat-object.mock';
import { TASK_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-target-flat-object.mock';
import { TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/timeline-activity-flat-object.mock';

export const ALL_FLAT_OBJECT_METADATA_MOCKS = [
  TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK,
  NOTE_TARGET_FLAT_OBJECT_MOCK,
  OPPORTUNITY_FLAT_OBJECT_MOCK,
  PERSON_FLAT_OBJECT_MOCK,
  TASK_FLAT_OBJECT_MOCK,
  TASK_TARGET_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  NOTE_FLAT_OBJECT_MOCK,
  COMPANY_FLAT_OBJECT_MOCK,
  ATTACHMENT_FLAT_OBJECT_MOCK,
  FAVORITE_FLAT_OBJECT_MOCK,
  FAVORITE_FOLDER_FLAT_OBJECT_MOCK,
] as const;
