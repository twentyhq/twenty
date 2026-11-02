export function blobToDataUrl({ blob, label }: { blob: Blob; label: string }) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('error', () => {
      reject(reader.error ?? new Error(`Unable to read ${label}.`));
    });
    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        reject(new Error(`Unable to encode ${label}.`));
        return;
      }

      resolve(reader.result);
    });

    reader.readAsDataURL(blob);
  });
}
