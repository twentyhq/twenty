import { clsx } from 'clsx';

import { type AssistantAvatarFace } from '../../types/AssistantAvatarFace';
import sleepSymbol from '../assets/sleep-symbol.svg?url';
import { ASSISTANT_AVATAR_FACE_ASSET_BY_FACE } from '../constants/assistantAvatarFaceAssetByFace.constant';

import styles from './AnimatedAssistantAvatarFace.module.scss';

type AnimatedAssistantAvatarFaceProps = {
  face: AssistantAvatarFace;
};

export const AnimatedAssistantAvatarFace = ({
  face,
}: AnimatedAssistantAvatarFaceProps) => {
  const eyeAsset =
    ASSISTANT_AVATAR_FACE_ASSET_BY_FACE[face === 'wink' ? 'default' : face];
  const eyeStyle = { maskImage: `url("${eyeAsset}")` };

  return (
    <span aria-hidden="true" className={styles.root} data-face={face}>
      <span className={clsx(styles.eye, styles.leftEye)} style={eyeStyle} />
      <span className={clsx(styles.eye, styles.rightEye)} style={eyeStyle} />
      {face === 'wink' && (
        <span
          className={styles.wink}
          style={{
            maskImage: `url("${ASSISTANT_AVATAR_FACE_ASSET_BY_FACE.wink}")`,
          }}
        />
      )}
      {face === 'sleepy' && (
        <span
          className={styles.sleepSymbol}
          style={{ maskImage: `url("${sleepSymbol}")` }}
        />
      )}
    </span>
  );
};
