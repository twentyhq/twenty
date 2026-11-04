import { isNonEmptyString } from '@sniptt/guards';
import { type IframeMediaPermission } from '../../types/IframeMediaPermission';
import { isDefined } from '../validation';
import { normalizeIframeOrigin } from './normalizeIframeOrigin';

const MEDIA_DIRECTIVE_PREFIX_PATTERN = /^(?:microphone|camera)/i;

export const getIframeMediaAllow = ({
  allow,
  permission,
}: {
  allow?: string;
  permission?: IframeMediaPermission | null;
}): string => {
  const otherDirectives = (allow ?? '')
    .split(';')
    .map((directive) => directive.trim())
    .filter(
      (directive) =>
        isNonEmptyString(directive) &&
        !MEDIA_DIRECTIVE_PREFIX_PATTERN.test(directive),
    );
  const origin = isDefined(permission)
    ? normalizeIframeOrigin(permission.origin, { isHttpsOnly: true })
    : undefined;
  const microphoneOrigin =
    isDefined(origin) && permission?.microphone ? origin : "'none'";
  const cameraOrigin =
    isDefined(origin) && permission?.camera ? origin : "'none'";

  return [
    `microphone ${microphoneOrigin}`,
    `camera ${cameraOrigin}`,
    ...otherDirectives,
  ].join('; ');
};
