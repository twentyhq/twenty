import { FileFolder } from 'src/core/file/interfaces/file-folder.interface';

import { ShortCropSize } from 'src/utils/image';

type ValueOfFileFolder = `${FileFolder}`;

export interface Settings {
  storage: {
    imageCropSizes: {
      [key in ValueOfFileFolder]?: ShortCropSize[];
    };
  };
}
