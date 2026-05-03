import process from 'process';

import opentelemetry from '@opentelemetry/api';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
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
    beforeSend: (event) => {
      const message = event.exception?.values?.[0]?.value ?? '';

      // Duplicate key errors on metadata create actions are caused by
      // client-side race conditions (e.g. double-click on "Update view").
      // These are not server bugs — downgrade to warning level so they
      // don't create noisy Sentry alerts.
      if (
        message.includes("Migration action 'create'") &&
        message.includes('failed') &&
        event.breadcrumbs?.some((breadcrumb) =>
          String(breadcrumb.message ?? '').includes(
            'duplicate key value violates unique constraint',
          ),
        )
      ) {
        event.level = 'warning';
        event.fingerprint = [
          'duplicate-key-metadata-create',
          ...(event.fingerprint ?? ['{{ default }}']),
        ];
      }

      return event;
    },
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.3,
    sendDefaultPii: true,
    debug: process.env.NODE_ENV === NodeEnvironment.DEVELOPMENT,
    beforeSendSpan: (span) => {
      const twentyContext = Sentry.getIsolationScope().getScopeData().contexts
        ?.twenty as
        | {
            workspace_id?: string;
            user_workspace_id?: string;
          }
        | undefined;

      if (!twentyContext?.workspace_id) {
        return span;
      }

      span.data = {
        ...span.data,
        'twenty.workspace.id': twentyContext.workspace_id,
        ...(twentyContext.user_workspace_id && {
          'twenty.user_workspace.id': twentyContext.user_workspace_id,
        }),
      };

      return span;
    },
  });
}

// Meter setup

const prometheusExporter = meterDrivers.includes(MeterDriver.Prometheus)
  ? new PrometheusExporter({ port: 9464 })
  : null;

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
    ...(prometheusExporter ? [prometheusExporter] : []),
  ],
});

opentelemetry.metrics.setGlobalMeterProvider(meterProvider);
