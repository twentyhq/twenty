import { RecordDuplicateCriteria } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

export const duplicateCriteriaCollection: RecordDuplicateCriteria[] = [
  {
    objectName: 'company',
    fieldNames: ['domain'],
  },
  {
    objectName: 'company',
    fieldNames: ['name'],
  },
  {
    objectName: 'person',
    fieldNames: ['nameFirstName', 'nameLastName'],
  },
  {
    objectName: 'person',
    fieldNames: ['email'],
  },
];
