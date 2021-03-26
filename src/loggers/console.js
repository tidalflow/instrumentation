const chalk = require("chalk");

const levels = ["trace", "debug", "info", "warn", "error", "fatal"];

class ConsoleLogger {
  _version = "console";
  _level = "info";

  constructor(props = {}) {
    this.props = props;
  }

  child(props) {
    return new ConsoleLogger({ ...this.props, ...props });
  }

  set level(level) {
    this._level = level.toLowerCase();
  }

  get level() {
    return this._level;
  }

  get version() {
    return this._version;
  }

  write(loggerFn, level, ...args) {
    if ([levels].indexOf(this.level) > [levels].indexOf(level)) {
      return;
    }

    let levelStr = chalk.yellow(level.toUpperCase());
    if (["trace", "debug", "info"].includes(level)) {
      levelStr = chalk.gray(level.toUpperCase());
    } else if (["warn"].includes(level)) {
      levelStr = chalk.yellow(level.toUpperCase());
    } else if (["error", "fatal"].includes(level)) {
      levelStr = chalk.red(level.toUpperCase());
    }

    loggerFn(
      chalk.dim(`[${new Date().toISOString()}]`),
      levelStr,
      ...Object.keys(this.props).map((key) => {
        return `${key}: ${this.props[key]}`;
      }),
      ...args
    );
  }

  trace(...args) {
    this.write(console.trace, "trace", ...args);
  }

  debug(...args) {
    this.write(console.debug, "debug", ...args);
  }

  info(...args) {
    this.write(console.info, "info", ...args);
  }

  warn(...args) {
    this.write(console.warn, "warn", ...args);
  }

  error(...args) {
    this.write(console.error, "error", ...args);
  }

  fatal(...args) {
    this.fatal(console.error, "fatal", ...args);
  }
}

module.exports = new ConsoleLogger();
