import { TraceService } from './trace.service';
import { KafkaContext } from '@nestjs/microservices';
import { randomUUID } from 'crypto';

export function Traceable(
  traceIdExtractor?: (...args: any[]) => string | undefined,
): MethodDecorator {
  return function (target, propertyKey, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const context: KafkaContext | undefined = args.find(
        (arg) => arg instanceof KafkaContext,
      );
      const message = context?.getMessage();
      const traceHeader = message?.headers?.['x-trace-id'];
      const traceId =
        traceIdExtractor?.(...args) ||
        (traceHeader ? traceHeader.toString() : undefined) ||
        randomUUID();

      return TraceService.runWithTrace(traceId, () =>
        originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
}
