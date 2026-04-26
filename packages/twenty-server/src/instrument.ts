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
import { aiCallContextStorage } from 'src/engine/metadata-modules/ai/ai-call-context/storage/ai-call-context.storage';
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
    beforeSendSpan: (span) => {
      const op = span.op ?? '';
      const origin = span.origin ?? '';
      const isGenAiSpan =
        op.startsWith('gen_ai.') || origin === 'auto.vercelai.otel';

      if (!isGenAiSpan) {
        return span;
      }

      const context = aiCallContextStorage.getStore();

      if (!context) {
        return span;
      }

      span.data = span.data ?? {};
      span.data['twenty.workspace_id'] = context.workspaceId;

      if (context.userWorkspaceId != null) {
        span.data['twenty.user_workspace_id'] = context.userWorkspaceId;
      }

      if (context.agentId != null) {
        span.data['twenty.agent_id'] = context.agentId;
      }

      if (context.workflowRunId != null) {
        span.data['twenty.workflow_run_id'] = context.workflowRunId;
      }

      if (context.threadId != null) {
        span.data['twenty.thread_id'] = context.threadId;
      }

      if (context.turnId != null) {
        span.data['twenty.turn_id'] = context.turnId;
      }

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
