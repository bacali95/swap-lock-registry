import { blue, green, red, yellow } from 'chalk';
import { clearLine, cursorTo } from 'readline';

class Logger {
  clearLine(): void {
    clearLine(process.stdout, 0);
    cursorTo(process.stdout, 0);
  }

  progress(context: string, ...args): void {
    this.clearLine();
    process.stdout.write(`${blue(`[${context}]`)} ${yellow(args)}`);
  }

  success(context: string, ...args): void {
    console.log(blue(`[${context}]`), green(...args));
  }

  warning(context: string, ...args): void {
    console.log(blue(`[${context}]`), yellow(...args));
  }

  error(context: string, ...args): void {
    console.error(blue(`[${context}]`), red(...args));
  }
}

export const logger = new Logger();
