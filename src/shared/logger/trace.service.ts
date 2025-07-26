import { AsyncLocalStorage } from 'async_hooks';
import { randomUUID } from 'crypto';

type TraceContext = {
  traceId: string;
};

const storage = new AsyncLocalStorage<TraceContext>();

export class TraceService {
  static runWithTrace(traceId: string, fn: () => any): any {
    const context = { traceId };
    return storage.run(context, fn);
  }

  static generateAndRun(fn: () => any): any {
    const traceId = TraceService.generateTraceId();
    return TraceService.runWithTrace(traceId, fn);
  }

  static getTraceId(): string | undefined {
    return storage.getStore()?.traceId;
  }

  static generateTraceId(): string {
    return randomUUID();
  }
}
