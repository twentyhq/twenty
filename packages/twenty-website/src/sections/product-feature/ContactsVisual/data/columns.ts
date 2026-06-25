import { type ContactColumn } from '../types/contact-column';

export const COLUMNS: ContactColumn[] = [
  { id: 'company', label: 'Companies', width: 180, isFirstColumn: true },
  { id: 'url', label: 'Url', width: 140 },
  { id: 'createdBy', label: 'Created By', width: 150 },
  { id: 'address', label: 'Address', width: 140 },
  { id: 'accountOwner', label: 'Account Owner', width: 150 },
  { id: 'icp', label: 'ICP', width: 80 },
  { id: 'arr', label: 'ARR', width: 120 },
  { id: 'industry', label: 'Industry', width: 140 },
];
