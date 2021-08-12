# @bedrockio/instrumentation

This providers tools to instrumentate your api

- Expose logger (wrapping https://getpino.io)
- Http logging middleware
- Providers tracing of your application via https://opentelemetry.io/

For exporting both logging and tracing:
The package assumes you are running in a Google Cloud environment (production).
Locally its using https://zipkin.io/. If a server is available.

## Install

```bash
npm install @bedrockio/instrumentation
```

## Usage

**Important** This should be initalized before any other code is executed / required or it will not work correctly.

```javascript
const { setupTelemetry } = require("@bedrockio/instrumentation");
if (process.env.NODE_ENV === "production") {
  setupTelemetry();
}
// other code
```

## Development vs Production

When `process.env.NODE_ENV != production` some features are turned off or swapped out with development friendly solutions:

- Tracing/Instrumention is turned off (makes boot time faster)
- Simple output rendering using `console`
- Allows silencing output with log levels.

## Log Levels

Setting `process.env.LOG_LEVEL` will set the log level which silences lower level output. The levels are:

- trace
- debug
- info
- warn
- error
- fatal

### Methods

#### setupTelemetry

setup the instrumentations (tracing).

#### getTracer

Returns a tracer from the global tracer provider

#### createLogger

```
createLogger(props): Logger
```

#### getMeterProvider

```
getMeterProvider({ name: "MyMetric" }): Meter
```

Example:

```javascript
const { getMeterProvider } = require("@bedrockio/instrumentation");

const meter = getMeterProvider();

const counter = meter.createCounter("metric_name", {
  description: "Example of a counter",
});

counter.add(10);
```

See https://github.com/open-telemetry/opentelemetry-js/tree/main/packages/opentelemetry-sdk-metrics-base for more examples

#### loggingMiddleware

Http logging middleware

### Properties

#### logger

```
logger.info("Hello", { "foo": "bar" })
```

The default logger
