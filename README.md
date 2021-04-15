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
if(process.env.NODE_ENV === 'production') {
  setupTelemetry();
}
// other code
```

## Developer mode vs Production mode

In none product mode (process.env.NODE_ENV != `production`) some features are turn off or swapped out with development friendly solutions.

- Tracing/Instrumention is turned off (makes the boot time slower)
- The logger is switch to develop friendly solution
  - No request context (doesn't work without tracing)
  - No structured logging output, simple output rendering using `console`

### Methods

#### setupTelemetry

setup the instrumentations (tracing).

#### getTracer

Returns a tracer from the global tracer provider

#### createLogger

```
createLogger(props): Logger
```

Create a new logger instance

#### loggingMiddleware

Http logging middleware

### Propterties

#### logger

```
logger.info("Hello", { "foo": "bar" })
```

The default logger
