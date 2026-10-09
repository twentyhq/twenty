import { useRender } from '@base-ui/react/use-render';
import { useMergedRefs } from '@base-ui/utils/useMergedRefs';
import { isNonEmptyString } from '@sniptt/guards';
import { clsx } from 'clsx';
import { type ChangeEvent, useId, useRef } from 'react';

import { IconTrash, IconUpload, IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './ImageInput.module.scss';
import { ImageInputPreview } from './internal/ImageInputPreview';
import { type ImageInputProps } from './types/ImageInputProps';

const DEFAULT_IMAGE_ACCEPT = 'image/*';

export const ImageInput = ({
  src,
  onFileSelect,
  onRemove,
  onAbort,
  disabled = false,
  isUploading = false,
  helperText,
  errorMessage,
  uploadLabel = 'Upload',
  removeLabel = 'Remove',
  abortLabel = 'Abort',
  fileInputProps = {},
  className,
  render,
  ref,
  ...props
}: ImageInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mergedFileInputRef = useMergedRefs(fileInputRef, fileInputProps.ref);
  const descriptionId = useId();
  const helperTextId = `${descriptionId}-helper`;
  const errorMessageId = `${descriptionId}-error`;
  const hasPicture = isNonEmptyString(src);
  const hasHelperText = isNonEmptyString(helperText);
  const hasErrorMessage = isNonEmptyString(errorMessage);
  const isSelectionUnavailable =
    disabled || fileInputProps.disabled || !isDefined(onFileSelect);
  const isRemovalUnavailable = disabled || !hasPicture || !isDefined(onRemove);
  const isUploadDisabled = isSelectionUnavailable || isUploading;
  const isRemoveDisabled = isRemovalUnavailable || isUploading;
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

    try {
      fileInputProps.onChange?.(event);
    } finally {
      event.currentTarget.value = '';
    }

    if (isUploadDisabled || !isDefined(file)) {
      return;
    }

    onFileSelect?.(file);
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
            disabled={isSelectionUnavailable}
            aria-disabled={isUploading || undefined}
            aria-label={uploadLabel}
            aria-describedby={describedBy}
            onClick={openFilePicker}
          >
            <ImageInputPreview key={src} src={src} />
          </button>
          <div className={styles.content}>
            <div className={styles.actions}>
              <input
                aria-label={uploadLabel}
                {...fileInputProps}
                ref={mergedFileInputRef}
                className={clsx(styles.fileInput, fileInputProps.className)}
                children={undefined}
                type="file"
                multiple={false}
                value={undefined}
                defaultValue={undefined}
                accept={fileInputProps.accept ?? DEFAULT_IMAGE_ACCEPT}
                disabled={isUploadDisabled}
                aria-describedby={
                  [fileInputProps['aria-describedby'], describedBy]
                    .filter(isNonEmptyString)
                    .join(' ') || undefined
                }
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
                  focusableWhenDisabled={isUploading && !isSelectionUnavailable}
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
                focusableWhenDisabled={isUploading && !isRemovalUnavailable}
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
