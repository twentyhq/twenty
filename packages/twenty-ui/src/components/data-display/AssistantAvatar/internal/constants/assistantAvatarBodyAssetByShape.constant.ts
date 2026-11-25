import arch from '../assets/body-arch.svg?url';
import burst from '../assets/body-burst.svg?url';
import circle from '../assets/body-circle.svg?url';
import cloud from '../assets/body-cloud.svg?url';
import clover from '../assets/body-clover.svg?url';
import cookie from '../assets/body-cookie.svg?url';
import flower from '../assets/body-flower.svg?url';
import gem from '../assets/body-gem.svg?url';
import hexagon from '../assets/body-hexagon.svg?url';
import pill from '../assets/body-pill.svg?url';
import { type AssistantAvatarShape } from '../../types/AssistantAvatarShape';

export const ASSISTANT_AVATAR_BODY_ASSET_BY_SHAPE = {
  arch,
  burst,
  circle,
  cloud,
  clover,
  cookie,
  flower,
  gem,
  hexagon,
  pill,
} satisfies Record<AssistantAvatarShape, string>;
