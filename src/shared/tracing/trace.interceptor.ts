import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { TraceService } from '@shared/tracing/trace.service';

@Injectable()
export class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const gqlCtx = context.getArgByIndex(2);
    const traceId = gqlCtx.req?.headers?.['x-trace-id'];
    return TraceService.runWithTrace(traceId, () => next.handle());
  }
}
