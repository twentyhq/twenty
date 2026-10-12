import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { ImageInput } from '../ImageInput';
import { type ImageInputProps } from '../types/ImageInputProps';
import { IMAGE_INPUT_PREVIEW_URL } from './imageInputPreviewUrl';

const INVALID_IMAGE_URL = 'data:image/png;base64,invalid';

export const ImageInputPreviewChangesExample = (props: ImageInputProps) => {
  const [src, setSrc] = useState<string | undefined>(IMAGE_INPUT_PREVIEW_URL);

  return (
    <>
      <ImageInput {...props} src={src} />
      <Button onClick={() => setSrc(INVALID_IMAGE_URL)}>Break preview</Button>
      <Button onClick={() => setSrc(IMAGE_INPUT_PREVIEW_URL)}>
        Restore preview
      </Button>
      <Button onClick={() => setSrc(undefined)}>Clear preview</Button>
    </>
  );
};
