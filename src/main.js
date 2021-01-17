const opentelemetry = require("@opentelemetry/api");

const { NodeTracerProvider } = require("@opentelemetry/node");
const { SimpleSpanProcessor } = require("@opentelemetry/tracing");

const { LogLevel } = require("@opentelemetry/core");

const isZiplinRunning = (port) =>
  new Promise((resolve) => {
    const server = require("http")
      .createServer()
      .listen(port, () => {
        server.close();
        resolve(false);
      })
      .on("error", () => {
        resolve(true);
      });
  });

/**
 * Returns a tracer from the global tracer provider
 * @param {string} [name]
 * @returns {opentelemetry.Tracer}
 */
exports.getTracer = function (name = "global") {
  return opentelemetry.trace.getTracer(name);
};

exports.initalize = function (options = {}) {
  const provider = new NodeTracerProvider({
    logLevel: LogLevel.WARN,
    plugins: {
      koa: {
        enabled: true,
        path: "@opentelemetry/koa-instrumentation",
        enhancedDatabaseReporting: true,
      },
    },
    ...options,
  });

  const {
    TraceExporter,
  } = require("@google-cloud/opentelemetry-cloud-trace-exporter");

  const { ZipkinExporter } = require("@opentelemetry/exporter-zipkin");

  if (process.env.NODE_ENV === "production") {
    // Configure the span processor to send spans to the exporter
    provider.addSpanProcessor(new SimpleSpanProcessor(new TraceExporter()));
  } else {
    isZiplinRunning(9411).then((running) => {
      if (running) {
        provider.addSpanProcessor(
          new SimpleSpanProcessor(new ZipkinExporter())
        );
      }
    });
  }

  return provider.register();
};
