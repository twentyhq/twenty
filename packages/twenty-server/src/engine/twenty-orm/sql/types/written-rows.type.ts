// A write statement whose RETURNING lists `returnedColumnNames`, in that order
export type WrittenRows = {
  statement: string;
  returnedColumnNames: string[];
};
