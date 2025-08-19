import { ATTACHMENT_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/attachment-flat-object.mock';
import { FAVORITE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/favorite-flat-object.mock';
import { FAVORITE_FOLDER_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/favorite-folder-flat-object.mock';
import { NOTE_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-flat-object.mock';
import { NOTE_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/note-target-flat-object.mock';
import { TASK_TARGET_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/task-target-flat-object.mock';
import { TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/timeline-activity-flat-object.mock';

export const STANDARD_RELATION_TARGET_FLAT_OBJECT_METADATA_MOCKS = [
  NOTE_FLAT_OBJECT_MOCK,
  TIMELINE_ACTIVITY_FLAT_OBJECT_MOCK,
  NOTE_TARGET_FLAT_OBJECT_MOCK,
  FAVORITE_FLAT_OBJECT_MOCK,
  ATTACHMENT_FLAT_OBJECT_MOCK,
  TASK_TARGET_FLAT_OBJECT_MOCK,
  FAVORITE_FOLDER_FLAT_OBJECT_MOCK,
] as const;
