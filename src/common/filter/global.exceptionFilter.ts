import { GqlArgumentsHost } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import {
  Catch,
  ArgumentsHost,
  HttpException,
  ExceptionFilter,
} from '@nestjs/common'

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch (exception: HttpException, host: ArgumentsHost) {

    const gqlHost = GqlArgumentsHost.create(host)
    const path = gqlHost.getInfo().fieldName

    const response = exception.getResponse() || {}
    const status = exception.getStatus()

    const errorMessage =
      typeof response === 'string'
        ? response
        : response['message'] ||
          exception.message ||
          'An unexpected error occurred'

    throw new GraphQLError(errorMessage, {
      extensions: {
        statusCode: status,
        message: errorMessage,
        timestamp: new Date().toISOString(),
        path,
        ...(typeof response === 'object' ? response : {}),
      },
    })
  }
}
