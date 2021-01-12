# @bedrockio/instrumentation

This auto instrumentations your code, the packages wrappers https://opentelemetry.io/ with a few default plugins.
The packages assumes you are running in a Google Cloud environment for exporting needs.

## Install

```bash
npm install @bedrockio/instrumentation
```

## Usage

**Important** This should be initalized before any other code is executed / required or it will not work correctly.

```javascript
const { initalize } = require("bedrockio/instrumentation");
initalize();

// other code
```

### Methods

#### initalize

Initialize the instrumentations.

#### getTracer

Returns a tracer from the global tracer provider
