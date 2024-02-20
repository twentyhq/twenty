import { RecordDuplicateCriteria } from 'src/workspace/workspace-query-builder/interfaces/record.interface';

export const duplicateCriteriaCollection: RecordDuplicateCriteria[] = [
  {
    objectName: 'company',
    columnNames: ['domainName'],
  },
  {
    objectName: 'company',
    columnNames: ['name'],
  },
  {
    objectName: 'person',
    columnNames: ['nameFirstName', 'nameLastName'],
  },
  {
    objectName: 'person',
    columnNames: ['email'],
  },
];
