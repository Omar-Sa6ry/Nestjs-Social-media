import { Catch, ArgumentsHost, HttpException, ExceptionFilter } from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext(); // Get GraphQL context (e.g., request)
    const path = gqlHost.getInfo().fieldName; // Get field causing error

    const status = exception.getStatus();
    const response = exception.getResponse();

    const errorMessage = typeof response === 'string' ? response : response['message'] || 'An error occurred';

    throw new GraphQLError(errorMessage, {
      extensions: {
        statusCode: status,
        timestamp: new Date().toISOString(),
        path,
        ...(typeof response === 'object' ? response : {}),
      },
    });
  }
}
