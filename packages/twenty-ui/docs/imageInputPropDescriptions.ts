import { type ImageInputProps } from '../src/components/input/ImageInput/types/ImageInputProps';

export const IMAGE_INPUT_PROP_DESCRIPTIONS = {
  src: 'Resolved image URL. Empty or failed images show the image placeholder.',
  onUpload:
    'Receives the selected File. Empty and canceled selections do not call it. Selection is disabled when omitted.',
  onRemove:
    'Requests removal of the current image. Removal is disabled without this callback or a nonempty src.',
  onAbort:
    'Shows an abort action while uploading. It can cancel the first upload before a src exists.',
  disabled: 'Disables file selection, removal, and abort actions.',
  isUploading:
    'Marks the module busy and disables selection and removal. Shows Abort when onAbort is supplied.',
  helperText:
    'Application instructions, associated with the selection controls.',
  errorMessage:
    'Application error, displayed as an alert and associated with the selection controls.',
  uploadLabel: 'Label for the preview, file selector, and Upload action.',
  removeLabel: 'Label for the Remove action.',
  abortLabel: 'Label for the Abort action.',
  accept:
    'Native file picker filter. Defaults to image/*. The application validates the selected file.',
  render:
    'Custom root element or render function. Keep a non-interactive root.',
  ref: 'Ref to the root element.',
  className: 'Class applied to the root element.',
  style: 'Inline style applied to the root element.',
} satisfies Partial<Record<keyof ImageInputProps, string>>;
