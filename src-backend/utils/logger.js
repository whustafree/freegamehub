const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const timestamp = () => new Date().toLocaleString('es-CL');

module.exports = {
  info: (msg) => console.log(`${colors.cyan}[${timestamp()}] ℹ️ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}[${timestamp()}] ✅ ${msg}${colors.reset}`),
  error: (msg, err) => {
    const errMsg = err ? `: ${err.message}` : '';
    const stack = err && process.env.NODE_ENV !== 'production' ? `\n${err.stack}` : '';
    console.error(`${colors.red}[${timestamp()}] ❌ ${msg}${errMsg}${stack}${colors.reset}`);
  },
  warn: (msg) => console.warn(`${colors.yellow}[${timestamp()}] ⚠️ ${msg}${colors.reset}`),
  debug: (msg) => process.env.NODE_ENV === 'development' && console.log(`${colors.magenta}[${timestamp()}] 🔍 ${msg}${colors.reset}`)
};
