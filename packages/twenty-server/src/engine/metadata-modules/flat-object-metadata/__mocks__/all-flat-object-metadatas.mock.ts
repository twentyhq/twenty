import { ATTACHMENT_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/attachment-flat-object.mock';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { NOTE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-flat-object.mock';
import { NOTETARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/notetarget-flat-object.mock';
import { OPPORTUNITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/opportunity-flat-object.mock';
import { PERSON_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/person-flat-object.mock';
import { PET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/pet-flat-object.mock';
import { ROCKET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/rocket-flat-object.mock';
import { TASK_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-flat-object.mock';
import { TASKTARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/tasktarget-flat-object.mock';
import { TIMELINEACTIVITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/timelineactivity-flat-object.mock';

export const ALL_FLAT_OBJECT_METADATA_MOCKS = [
  TIMELINEACTIVITY_FLAT_OBJECT_MOCK,
  NOTETARGET_FLAT_OBJECT_MOCK,
  OPPORTUNITY_FLAT_OBJECT_MOCK,
  PERSON_FLAT_OBJECT_MOCK,
  TASK_FLAT_OBJECT_MOCK,
  TASKTARGET_FLAT_OBJECT_MOCK,
  PET_FLAT_OBJECT_MOCK,
  ROCKET_FLAT_OBJECT_MOCK,
  NOTE_FLAT_OBJECT_MOCK,
  COMPANY_FLAT_OBJECT_MOCK,
  ATTACHMENT_FLAT_OBJECT_MOCK,
] as const;
