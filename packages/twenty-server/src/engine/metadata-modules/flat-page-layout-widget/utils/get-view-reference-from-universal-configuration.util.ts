// Manifests built before the key was renamed to viewUniversalIdentifier
// carry the view universal identifier under viewId, and an empty reference
// means the widget is not bound to any view
export const getViewReferenceFromUniversalConfiguration = (
  universalConfiguration: unknown,
): unknown => {
  const { viewUniversalIdentifier, viewId } = (universalConfiguration ??
    {}) as {
    viewUniversalIdentifier?: unknown;
    viewId?: unknown;
  };

  const viewReference = viewUniversalIdentifier ?? viewId;

  return viewReference === '' ? null : viewReference;
};
