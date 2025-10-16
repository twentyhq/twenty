export interface ObjectRecord {
  id: string;

  [key: string]: any;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}
