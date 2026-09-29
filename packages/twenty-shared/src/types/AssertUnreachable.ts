// Type level counterpart of assertUnreachable: fails to compile when a switch
// statement does not handle every case, without any runtime behavior
export type AssertUnreachable<T extends never> = T;
