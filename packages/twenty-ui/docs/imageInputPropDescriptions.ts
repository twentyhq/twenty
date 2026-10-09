import { type ImageInputProps } from '../src/components/input/ImageInput/types/ImageInputProps';

export const IMAGE_INPUT_PROP_DESCRIPTIONS = {
  src: 'Resolved image URL. Empty or failed images show the image placeholder.',
  onFileSelect:
    'Fires when a file is selected and receives its usable File after the input resets. Empty and canceled selections do not call it. Selection is disabled when omitted. The caller owns validation and uploading.',
  onRemove:
    'Requests removal of the current image. Removal is disabled without this callback or a nonempty src.',
  onAbort:
    'Shows an abort action while uploading. It can cancel the first upload before a src exists.',
  disabled: 'Disables file selection, removal, and abort actions.',
  isUploading:
    'Marks the module busy. Selection and removal controls that would otherwise be enabled stay focusable but unavailable. Shows Abort when onAbort is supplied.',
  helperText:
    'Application instructions, associated with the selection controls.',
  errorMessage:
    'Application error, displayed as an alert and associated with the selection controls.',
  uploadLabel: 'Label for the preview, Upload action, and hidden file input.',
  removeLabel: 'Label for the Remove action.',
  abortLabel: 'Label for the Abort action.',
  fileInputProps:
    'Native props and HTMLInputElement ref for the hidden single-file input. accept defaults to image/*. Native onChange runs before the input resets. disabled blocks selection only. The input does not retain a file for form submission.',
  render:
    'Custom root element or render function. Keep a non-interactive root.',
  ref: 'Ref to the root div element.',
  className: 'Class applied to the root element.',
  style: 'Inline style applied to the root element.',
} satisfies Partial<Record<keyof ImageInputProps, string>>;
