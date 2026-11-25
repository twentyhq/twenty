import defaultFace from '../assets/face-default.svg?url';
import happy from '../assets/face-happy.svg?url';
import love from '../assets/face-love.svg?url';
import sleepy from '../assets/face-sleepy.svg?url';
import surprised from '../assets/face-surprised.svg?url';
import wink from '../assets/face-wink.svg?url';
import { type AssistantAvatarFace } from '../../types/AssistantAvatarFace';

export const ASSISTANT_AVATAR_FACE_ASSET_BY_FACE = {
  default: defaultFace,
  happy,
  love,
  sleepy,
  surprised,
  wink,
} satisfies Record<AssistantAvatarFace, string>;
