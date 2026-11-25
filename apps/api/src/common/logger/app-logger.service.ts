import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class AppLogger {
  private readonly logger = new Logger(AppLogger.name);

  error(message: string, trace?: string, context?: string): void {
    this.logger.error(message, trace, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  log(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }
}
