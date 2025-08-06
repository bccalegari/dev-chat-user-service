import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { TraceService } from '@shared/tracing/trace.service';

@Injectable()
export class TraceIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TraceIdMiddleware.name);

  use(req: any, res: any, next: (error?: any) => void): any {
    const traceId = req.headers['x-trace-id'];

    if (!traceId) {
      const isApolloPolling = req.body?.operationName === 'IntrospectionQuery';

      if (!isApolloPolling) {
        this.logger.warn(
          'No trace id found in request headers, generating a new one.',
        );
      }

      req.headers['x-trace-id'] = TraceService.generateTraceId();
    }

    next();
  }
}
