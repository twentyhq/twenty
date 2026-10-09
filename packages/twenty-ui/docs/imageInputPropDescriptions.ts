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
  accept:
    'Native file picker filter. Defaults to image/*. The caller validates allowed formats.',
  capture: 'Native device capture hint for the file picker.',
  name: 'Native name of the hidden file input.',
  id: 'Native identifier of the hidden file input.',
  title: 'Native title of the hidden file input.',
  form: 'Native form identifier associated with the hidden file input.',
  required:
    'Native file input requirement. The input resets after selection, so the caller validates completed uploads.',
  'aria-label':
    'Accessible name of the hidden file input. Defaults to uploadLabel.',
  'aria-labelledby': 'Accessible name reference for the hidden file input.',
  'aria-describedby':
    'Accessible description references for the hidden file input and selection buttons, combined with helperText and errorMessage.',
  inputRef: 'Ref to the hidden single-file HTMLInputElement.',
  onChange:
    'Native file input change event, fired while the selected file is present and before the input resets. The input does not retain a file for form submission.',
  dir: 'Text direction applied to both the root and hidden file input.',
  render:
    'Custom root element or render function. Supply root native attributes here and keep a non-interactive root.',
  ref: 'Ref to the root div element.',
  className: 'Class applied to the root element.',
  style: 'Inline style applied to the root element.',
} satisfies Partial<Record<keyof ImageInputProps, string>>;
