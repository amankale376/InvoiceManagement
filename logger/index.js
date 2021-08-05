const {format, createLogger, transports} = require('winston');
 const { timestamp, combine, printf } = format

const logFormat = printf(({level, message, timestamp, stack})=>{
  return `${timestamp} ${level} ${stack || message}`
})

const logger = createLogger({
 format:combine(timestamp(),
 format.errors({stack:true})
 , logFormat),

  transports: [
    new transports.File({ filename: 'error.log', level: 'error' }),
    new transports.File({ filename: 'combined.log' }),
  ],
});

module.exports = logger