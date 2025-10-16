export type ModifiedProperties<T, R> = Omit<T, keyof R> & R;
