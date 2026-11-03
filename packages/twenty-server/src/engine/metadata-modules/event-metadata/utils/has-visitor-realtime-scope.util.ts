import { type FlatEventMetadata } from 'src/engine/metadata-modules/flat-event-metadata/types/flat-event-metadata.type';

export const hasVisitorRealtimeScope = (
  flatEventMetadata: Pick<FlatEventMetadata, 'capabilities'>,
): boolean =>
  (flatEventMetadata.capabilities.realtime?.scopes ?? []).some(
    (scope) => scope.kind === 'visitor',
  );
