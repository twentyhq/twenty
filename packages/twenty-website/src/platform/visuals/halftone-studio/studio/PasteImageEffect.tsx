'use client';

import { useEffect } from 'react';

const CLIPBOARD_IMAGE_EXTENSION_BY_MIME: Record<string, string> = {
  'image/bmp': '.bmp',
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/svg+xml': '.svg',
  'image/webp': '.webp',
};

function isEditablePasteTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target.closest('[contenteditable=""], [contenteditable="true"]') !== null
  );
}

function createPastedImageFile(file: File) {
  const hasExtension = /\.[^.]+$/i.test(file.name);

  if (hasExtension) {
    return file;
  }

  const extension =
    CLIPBOARD_IMAGE_EXTENSION_BY_MIME[file.type] ??
    CLIPBOARD_IMAGE_EXTENSION_BY_MIME['image/png'];

  return new File([file], `pasted-image-${Date.now()}${extension}`, {
    type: file.type || 'image/png',
    lastModified: Date.now(),
  });
}

type PasteImageEffectProps = {
  onPasteImage: (file: File) => void;
  onPasteError: () => void;
};

export function PasteImageEffect({
  onPasteImage,
  onPasteError,
}: PasteImageEffectProps) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      if (isEditablePasteTarget(event.target)) {
        return;
      }

      const imageItem = Array.from(event.clipboardData?.items ?? []).find(
        (item) => item.type.startsWith('image/'),
      );

      if (!imageItem) {
        return;
      }

      const pastedFile = imageItem.getAsFile();

      if (!pastedFile) {
        onPasteError();
        return;
      }

      event.preventDefault();
      onPasteImage(createPastedImageFile(pastedFile));
    };

    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [onPasteImage, onPasteError]);

  return null;
}
