import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { CoreException } from '@shared/exceptions/core.exception';
import { TraceService } from '@shared/tracing/trace.service';

@Catch()
export class GraphQLExceptionFilter implements ExceptionFilter {
  private readonly logger: Logger = new Logger(GraphQLExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): any {
    const gqlHost = GqlArgumentsHost.create(host);
    const info = gqlHost.getInfo();
    const traceId = gqlHost.getContext().req?.headers['x-trace-id'];

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof CoreException) {
      message = exception.message;
      code = exception.code;
      status = exception.status;
    }

    TraceService.runWithTrace(traceId, () => {
      this.logger.error(
        `Error requesting ${info?.fieldName}, message: ${message}, code: ${code}, status: ${status}`,
      );
    });

    return new GraphQLError(message, {
      extensions: {
        code,
        status,
        timestamp: new Date().toISOString(),
        path: info?.fieldName || gqlHost.getArgs(),
      },
    });
  }
}
