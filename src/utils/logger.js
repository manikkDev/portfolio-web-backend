import env from '../config/env.js';

const isDev = env.nodeEnv === 'development';

const logger = {
  info: (...args) => console.log(`[INFO]  ${new Date().toISOString()}`, ...args),
  warn: (...args) => console.warn(`[WARN]  ${new Date().toISOString()}`, ...args),
  error: (...args) => console.error(`[ERROR] ${new Date().toISOString()}`, ...args),
  debug: (...args) => {
    if (isDev) console.debug(`[DEBUG] ${new Date().toISOString()}`, ...args);
  },
};

export default logger;
