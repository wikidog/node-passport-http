const winston = require('winston');

// winston
// const myFormat = winston.format.printf(info => {
//   // return `${info.timestamp} [${info.label}] ${info.level}: ${info.message}`;
//   return `${info.timestamp} ${info.level}: ${info.message}`;
// });
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL,
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.timestamp(),
    winston.format.simple()
    // myFormat
  ),
  transports: [
    new winston.transports.Console({
      // stderrLevels: ['error', 'warn', 'info', 'verbose', 'debug', 'silly'],
      handleExceptions: true,
    }),
  ],
  exitOnError: false,
});

logger.info('Winston log level: %s', process.env.LOG_LEVEL);

module.exports = logger;
