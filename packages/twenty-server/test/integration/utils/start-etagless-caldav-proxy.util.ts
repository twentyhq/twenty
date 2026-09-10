import {
  GenericContainer,
  type StartedNetwork,
  type StartedTestContainer,
  Wait,
} from 'testcontainers';

const MITMPROXY_IMAGE =
  'mitmproxy/mitmproxy:12.1.2@sha256:0d7b2a14b4a71a908cd6f31b8f50e29bbc5c8720fe6caa706acf782da558e5c7';
const MITMPROXY_PORT = 8080;
const ADDON_PATH = '/addon.py';

const STRIP_CHANGE_SIGNALS_ADDON = String.raw`
import os
import re

SYNC_COLLECTION_REPORT = re.compile(
    rb"<supported-report>\s*<report>\s*<sync-collection\s*/>\s*</report>\s*</supported-report>"
)
GETETAG = re.compile(rb"<(?:[A-Za-z0-9]+:)?getetag>[^<]*</(?:[A-Za-z0-9]+:)?getetag>")
GETLASTMODIFIED = re.compile(
    rb"<(?:[A-Za-z0-9]+:)?getlastmodified>[^<]*</(?:[A-Za-z0-9]+:)?getlastmodified>"
)

COLLECTION_WITHOUT_LAST_MODIFIED = os.environ["COLLECTION_WITHOUT_LAST_MODIFIED"]


def response(flow):
    if "xml" not in flow.response.headers.get("content-type", ""):
        return

    content = SYNC_COLLECTION_REPORT.sub(b"", flow.response.content)
    content = GETETAG.sub(b"<getetag />", content)

    if COLLECTION_WITHOUT_LAST_MODIFIED in flow.request.path:
        content = GETLASTMODIFIED.sub(b"<getlastmodified />", content)

    flow.response.content = content
`;

export type EtaglessCalDavProxy = {
  host: string;
  port: number;
  stop: () => Promise<void>;
};

export const startEtaglessCalDavProxy = async ({
  network,
  upstreamUrl,
  collectionWithoutLastModified,
}: {
  network: StartedNetwork;
  upstreamUrl: string;
  collectionWithoutLastModified: string;
}): Promise<EtaglessCalDavProxy> => {
  const container: StartedTestContainer = await new GenericContainer(
    MITMPROXY_IMAGE,
  )
    .withNetwork(network)
    .withCopyContentToContainer([
      { content: STRIP_CHANGE_SIGNALS_ADDON, target: ADDON_PATH },
    ])
    .withEnvironment({
      COLLECTION_WITHOUT_LAST_MODIFIED: collectionWithoutLastModified,
    })
    .withCommand([
      'mitmdump',
      '--mode',
      `reverse:${upstreamUrl}`,
      '--listen-host',
      '0.0.0.0',
      '--listen-port',
      String(MITMPROXY_PORT),
      '--scripts',
      ADDON_PATH,
    ])
    .withExposedPorts(MITMPROXY_PORT)
    .withWaitStrategy(Wait.forListeningPorts())
    .start();

  return {
    host: container.getHost(),
    port: container.getMappedPort(MITMPROXY_PORT),
    stop: async () => {
      await container.stop();
    },
  };
};
