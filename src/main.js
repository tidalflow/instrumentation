const opentelemetry = require("@opentelemetry/api");
const { MeterProvider } = require("@opentelemetry/metrics");
const {
  MetricExporter,
} = require("@google-cloud/opentelemetry-cloud-monitoring-exporter");

const {
  MongoDBInstrumentation,
} = require("@opentelemetry/instrumentation-mongodb");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { KoaInstrumentation } = require("@opentelemetry/instrumentation-koa");
const { NodeTracerProvider } = require("@opentelemetry/node");

const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");
const {
  // ConsoleSpanExporter,
  BatchSpanProcessor,
} = require("@opentelemetry/tracing");

const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { logger, createLogger, loggingMiddleware } = require("./logging");

/**
 * Returns a tracer from the global tracer provider
 * @param {string} [name]
 * @returns {opentelemetry.Tracer}
 */
exports.getTracer = function (name = "global") {
  return opentelemetry.trace.getTracer(name);
};

exports.logger = logger;
exports.createLogger = createLogger;
exports.loggingMiddleware = loggingMiddleware;

function setupTelemetry(options = {}) {
  const provider = new NodeTracerProvider();
  provider.register();

  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        ...options.http,
      }),
      new KoaInstrumentation({
        ...options.koa,
      }),
      new MongoDBInstrumentation({
        // see under for available configuration
        ...options.mongodb,
      }),
    ],
    tracerProvider: provider,
  });

  // Configure the span processor to send spans to the exporter
  provider.addSpanProcessor(new BatchSpanProcessor(new TraceExporter()));
  // provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter()));

  return provider.register();
}

exports.setupTelemetry = setupTelemetry;

exports.initalize = exports.initialize = function (args) {
  console.warn(
    `@bedrockio/instrumentation "initialize" is deprecated please use "setupTelemetry" instead.`
  );
  setupTelemetry(args);
};

const exporter = new MetricExporter();
exports.getMeterProvider = function (options = {}) {
  // Register the exporter
  return new MeterProvider({
    exporter,
    interval: options.interval || 60000,
  }).getMeter(options.name || "your-meter-name", options.version);
};
