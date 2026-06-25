import { type ContactColumnId } from './contact-column-id';

export type ContactColumn = {
  id: ContactColumnId;
  isFirstColumn?: boolean;
  label: string;
  width: number;
};
