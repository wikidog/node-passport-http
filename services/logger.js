const winston = require('winston');

// winston
// const myFormat = winston.format.printf(info => {
//   // return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
//   return `${info.timestamp} ${info.level}: ${info.message}`;
// });
const logLevel = process.env.LOG_LEVEL || 'debug';
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.simple()
    // myFormat
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error', 'warn'],
      // TODO: is this good?
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

logger.info('Winston log level: %s', logger.level);

module.exports = logger;
