import { v5 } from 'uuid';

export const getAttachmentNotOfMessageUniversalIdentifier = ({
  kind,
  roleUniversalIdentifier,
}: {
  kind: 'rule' | 'group' | 'predicate';
  roleUniversalIdentifier: string;
}): string => v5(`attachmentNotOfMessage:${kind}`, roleUniversalIdentifier);
