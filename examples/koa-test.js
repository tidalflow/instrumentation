process.env.NODE_ENV = "production";

const { logger, setupTelemetry, loggingMiddleware } = require("../src/main");
setupTelemetry();

const Koa = require("koa");
const Router = require("@koa/router");

const app = new Koa();

async function errorHandler(ctx, next) {
  try {
    await next();
  } catch (err) {
    let { status = 500, message, details } = err;
    ctx.type = "json";
    ctx.status = status;
    ctx.body = {
      error: { message, status, details },
    };
    ctx.app.emit("error", err, ctx);
  }
}

app.use(errorHandler).use(loggingMiddleware());

app.on("error", (err, ctx) => {
  if (err.code === "EPIPE" || err.code === "ECONNRESET") {
    // When streaming media, clients may arbitrarily close the
    // connection causing these errors when writing to the stream.
    return;
  }
  // dont output stacktraces of errors that is throw with status, as they are known errors
  if (!err.status || err.status === 500) {
    ctx.logger.error(err);
  }
});

const router = new Router();
router.get("/", (ctx) => {
  ctx.body = {};
});

router.get("/error", (ctx) => {
  throw Error("hellow");
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(8080);
