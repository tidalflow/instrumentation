const pino = require("pino");

const hooks = {
  logMethod(inputArgs, method) {
    if (inputArgs.length >= 2) {
      const arg1 = inputArgs.shift();
      const arg2 = inputArgs.shift();
      return method.apply(this, [
        {
          details: arg2,
          additionalProps: inputArgs.length ? inputArgs : undefined,
        },
        arg1,
      ]);
    }
    return method.apply(this, inputArgs);
  },
};

module.exports = pino({
  messageKey: "message",
  formatters: {
    level(_, level) {
      if (level === 20) {
        return { severity: "debug" };
      }
      if (level === 30) {
        return { severity: "info" };
      }
      if (level === 40) {
        return { severity: "warning" };
      }
      if (level === 50) {
        return { severity: "error" };
      }
      if (level >= 60) {
        return { severity: "critical" };
      }
      return { severity: "default" };
    },
  },
  base: null,
  level: process.env.LOG_LEVEL || "info",
  timestamp: pino.stdTimeFunctions.isoTime,
  hooks,
});
