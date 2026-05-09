'use client';

import { useEffect } from 'react';

type UseDefaultHalftoneImageOptions = {
  loadDefaultImageFile: () => Promise<File>;
  setImageFile: (updater: (currentFile: File | null) => File | null) => void;
};

export function useDefaultHalftoneImage({
  loadDefaultImageFile,
  setImageFile,
}: UseDefaultHalftoneImageOptions) {
  useEffect(() => {
    void loadDefaultImageFile()
      .then((file) => {
        setImageFile((currentFile) => currentFile ?? file);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [loadDefaultImageFile, setImageFile]);
}
