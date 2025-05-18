const pino = require('pino');


export const logger = pino({
  prettyPrint: process.env.NODE_ENV === 'development',
});
