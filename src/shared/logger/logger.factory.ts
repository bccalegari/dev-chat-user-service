import { format, transports } from 'winston';
import { WinstonModule } from 'nest-winston';
import { TraceService } from '@shared/logger/trace.service';

export const LoggerFactory = (serviceName: string) => {
  return WinstonModule.createLogger({
    level: process.env.DEBUG === 'true' ? 'debug' : 'info',
    defaultMeta: {
      label: serviceName,
    },
    transports: [new transports.Console()],
    format: format.combine(
      format.timestamp(),
      format.ms(),
      format.printf(
        ({
          level,
          message,
          timestamp,
          context,
          label,
        }: {
          level: string;
          message: string;
          timestamp: string;
          context: string | object;
          label?: string;
        }) => {
          const traceId = TraceService.getTraceId();

          const parts = [
            `[${timestamp}]`,
            `[${label}]`,
            context && typeof context == 'string' ? `[${context}]` : null,
            traceId ? `[${traceId}]` : null,
            `${level}: ${message}`,
          ];
          return parts.filter(Boolean).join(' ');
        },
      ),
    ),
  });
};
