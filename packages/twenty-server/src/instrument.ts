import process from 'process';

import opentelemetry from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import {
  AggregationTemporality,
  ConsoleMetricExporter,
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';

import { ExceptionHandlerDriver } from 'src/engine/core-modules/exception-handler/interfaces';
import { MeterDriver } from 'src/engine/core-modules/metrics/types/meter-driver.type';
import { parseArrayEnvVar } from 'src/utils/parse-array-env-var';

const meterDrivers = parseArrayEnvVar(
  process.env.METER_DRIVER,
  Object.values(MeterDriver),
  [],
);

if (process.env.EXCEPTION_HANDLER_DRIVER === ExceptionHandlerDriver.SENTRY) {
  Sentry.init({
    environment: process.env.SENTRY_ENVIRONMENT,
    release: process.env.APP_VERSION,
    dsn: process.env.SENTRY_DSN,
    integrations: [
      Sentry.redisIntegration(),
      Sentry.httpIntegration(),
      Sentry.expressIntegration(),
      Sentry.graphqlIntegration(),
      Sentry.postgresIntegration(),
      Sentry.vercelAIIntegration({
        recordInputs: true,
        recordOutputs: true,
      }),
      nodeProfilingIntegration(),
    ],
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.3,
    sendDefaultPii: true,
    debug: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
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
              temporalityPreference: AggregationTemporality.DELTA,
            }),
            exportIntervalMillis: 10000,
          }),
        ]
      : []),
  ],
});

opentelemetry.metrics.setGlobalMeterProvider(meterProvider);
