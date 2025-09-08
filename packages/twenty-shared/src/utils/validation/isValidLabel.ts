export const isValidLabel = (label: string): boolean => {
    return /^[A-Za-z0-9\s\-_.$#@!()[\]{}]+$/.test(label);
};
  