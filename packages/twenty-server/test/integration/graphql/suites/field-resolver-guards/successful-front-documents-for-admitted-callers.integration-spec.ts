import {
  FRONT_DOCUMENT_CALLERS,
  type FrontDocumentCaller,
  type FrontDocumentName,
} from 'test/integration/graphql/suites/field-resolver-guards/utils/front-document-callers.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

const CALLERS_EVERY_DOCUMENT_ADMITS = [
  FRONT_DOCUMENT_CALLERS.admin,
  FRONT_DOCUMENT_CALLERS.memberWithoutPermissionFlags,
  FRONT_DOCUMENT_CALLERS.guest,
];

const ADMITTED_CALLERS_BY_DOCUMENT: Record<
  FrontDocumentName,
  FrontDocumentCaller[]
> = {
  GetCurrentUser: CALLERS_EVERY_DOCUMENT_ADMITS,
  ObjectMetadataItems: [
    ...CALLERS_EVERY_DOCUMENT_ADMITS,
    FRONT_DOCUMENT_CALLERS.apiKey,
    FRONT_DOCUMENT_CALLERS.userBoundApplicationToken,
    FRONT_DOCUMENT_CALLERS.unboundApplicationToken,
  ],
  FindAllViews: [
    ...CALLERS_EVERY_DOCUMENT_ADMITS,
    FRONT_DOCUMENT_CALLERS.apiKey,
    FRONT_DOCUMENT_CALLERS.userBoundApplicationToken,
    FRONT_DOCUMENT_CALLERS.unboundApplicationToken,
  ],
};

describe('Front documents should resolve every field for an admitted caller', () => {
  describe.each(Object.entries(ADMITTED_CALLERS_BY_DOCUMENT))(
    'the %s document of twenty-front',
    (documentName, callers) => {
      it.each(callers)('should answer $title', async ({ arrange }) => {
        const caller = await arrange();

        try {
          const response = await makeMetadataApiRequest(
            {
              query: readFrontMetadataDocument(
                documentName as FrontDocumentName,
              ),
            },
            caller.token,
          );

          expect(response.body.errors).toBeUndefined();
          expect(response.body.data).toBeDefined();
          expect(response.body.data).not.toBeNull();
        } finally {
          await caller.cleanup();
        }
      });
    },
  );
});
