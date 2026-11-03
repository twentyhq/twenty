import 'tsconfig-paths/register';

const OPEN_HANDLE_DIAGNOSTICS_TIMEOUT_MS = 15_000;

type DiagnosticEndpoint = { host: string; port: number };

type DiagnosticLibuvHandle = {
  type: string;
  is_active: boolean;
  is_referenced: boolean;
  localEndpoint?: DiagnosticEndpoint | null;
  remoteEndpoint?: DiagnosticEndpoint | null;
};

export default async () => {
  await global.app.close();
  await global.testDataSource.destroy();

  if (process.env.INTEGRATION_OPEN_HANDLE_DIAGNOSTICS !== 'true') {
    return;
  }

  setTimeout(() => {
    const activeResources = process.getActiveResourcesInfo();
    const { libuv } = process.report.getReport() as {
      libuv: DiagnosticLibuvHandle[];
    };
    const activeHandles = libuv
      .filter(
        ({ is_active: isActive, is_referenced: isReferenced }) =>
          isActive && isReferenced,
      )
      .map(({ type, localEndpoint, remoteEndpoint }) => ({
        type,
        localEndpoint: {
          host: localEndpoint?.host,
          port: localEndpoint?.port,
        },
        remoteEndpoint: {
          host: remoteEndpoint?.host,
          port: remoteEndpoint?.port,
        },
      }));

    throw new Error(
      `Integration test process remained alive after teardown. ${JSON.stringify({ activeResources, activeHandles })}`,
    );
  }, OPEN_HANDLE_DIAGNOSTICS_TIMEOUT_MS).unref();
};
