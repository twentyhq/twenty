import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type ChangeEvent, useId, useRef } from 'react';

import { IconTrash, IconUpload, IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ImageInput.module.scss';
import { ImageInputPreview } from './internal/ImageInputPreview';
import { type ImageInputProps } from './types/ImageInputProps';

export const ImageInput = ({
  src,
  onUpload,
  onRemove,
  onAbort,
  disabled = false,
  isUploading = false,
  helperText,
  errorMessage,
  uploadLabel = 'Upload',
  removeLabel = 'Remove',
  abortLabel = 'Abort',
  accept = 'image/*',
  className,
  render,
  ref,
  ...props
}: ImageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionId = useId();
  const helperTextId = `${descriptionId}-helper`;
  const errorMessageId = `${descriptionId}-error`;
  const hasPicture = isNonEmptyString(src);
  const hasHelperText = isNonEmptyString(helperText);
  const hasErrorMessage = isNonEmptyString(errorMessage);
  const isUploadDisabled = disabled || isUploading || !isDefined(onUpload);
  const isRemoveDisabled =
    disabled || isUploading || !hasPicture || !isDefined(onRemove);
  const showAbort = isUploading && isDefined(onAbort);
  const describedBy =
    [hasHelperText && helperTextId, hasErrorMessage && errorMessageId]
      .filter(isNonEmptyString)
      .join(' ') || undefined;

  const openFilePicker = () => {
    if (isUploadDisabled) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];

    event.currentTarget.value = '';

    if (isUploadDisabled || !isDefined(file)) {
      return;
    }

    onUpload?.(file);
  };

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.root, className),
      'aria-busy': isUploading || props['aria-busy'],
      children: (
        <>
          <button
            className={styles.preview}
            type="button"
            data-has-picture={hasPicture || undefined}
            disabled={isUploadDisabled}
            aria-label={uploadLabel}
            aria-describedby={describedBy}
            onClick={openFilePicker}
          >
            <ImageInputPreview key={src} src={src} />
          </button>
          <div className={styles.content}>
            <div className={styles.actions}>
              <input
                ref={fileInputRef}
                className={styles.fileInput}
                type="file"
                accept={accept}
                disabled={isUploadDisabled}
                aria-label={uploadLabel}
                aria-describedby={describedBy}
                aria-invalid={hasErrorMessage || undefined}
                hidden
                onChange={handleFileChange}
              />
              {showAbort ? (
                <Button
                  type="button"
                  startIcon={<IconX />}
                  onClick={onAbort}
                  disabled={disabled}
                  variant="outline"
                >
                  {abortLabel}
                </Button>
              ) : (
                <Button
                  type="button"
                  startIcon={<IconUpload />}
                  onClick={openFilePicker}
                  disabled={isUploadDisabled}
                  aria-describedby={describedBy}
                  variant="outline"
                >
                  {uploadLabel}
                </Button>
              )}
              <Button
                type="button"
                startIcon={<IconTrash />}
                onClick={onRemove}
                disabled={isRemoveDisabled}
                variant="outline"
              >
                {removeLabel}
              </Button>
            </div>
            {hasHelperText && (
              <span className={styles.helperText} id={helperTextId}>
                {helperText}
              </span>
            )}
            {hasErrorMessage && (
              <span
                className={styles.errorMessage}
                id={errorMessageId}
                role="alert"
              >
                {errorMessage}
              </span>
            )}
          </div>
        </>
      ),
    },
  });
};
