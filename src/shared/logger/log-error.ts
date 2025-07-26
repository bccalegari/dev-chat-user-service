import { Logger } from '@nestjs/common';

export function logError(message: string, error: Error, logger: Logger): void {
  logger.error(message, error.message, error.stack);
}
