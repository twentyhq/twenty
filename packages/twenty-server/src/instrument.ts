import process from 'process';

import opentelemetry from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { NodeEnvironment } from 'src/engine/core-modules/environment/interfaces/node-environment.interface';

import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { WorkspaceCacheKeys } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { parseArrayEnvVar } from 'src/utils/parse-array-env-var';

export enum MeterDriver {
  OpenTelemetry = 'opentelemetry',
  Console = 'console',
}

const meterDrivers = parseArrayEnvVar(
  process.env.METER_DRIVER,
  Object.values(MeterDriver),
  [MeterDriver.Console],
);

if (process.env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.Sentry) {
  Sentry.init({
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.SENTRY_RELEASE,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      // TODO: Redis integration doesn't seem to work - investigate why
      Sentry.redisIntegration({
        cachePrefixes: Object.values(WorkspaceCacheKeys).map(
          (key) => `engine:${key}:`,
        ),
      }),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.postgresIntegration(),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.3,
    debug: process.env.NODE_ENV === NodeEnvironment.development,
  });
}

// Meter setup

const meterProvider = new MeterProvider({
  readers: [
    ...(meterDrivers.includes(MeterDriver.Console)
      ? [
          new PeriodicExportingMetricReader({
            exporter: new ConsoleMetricExporter(),
            exportIntervalMillis: 10000,
          }),
        ]
      : []),
    ...(meterDrivers.includes(MeterDriver.OpenTelemetry)
      ? [
          new PeriodicExportingMetricReader({
            exporter: new OTLPMetricExporter({
              url: process.env.OTLP_COLLECTOR_METRICS_ENDPOINT_URL,
            }),
            exportIntervalMillis: 10000,
          }),
        ]
      : []),
  ],
});

opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

process.on('SIGTERM', async () => {
  await meterProvider.shutdown();
  process.exit(0);
});
