import { ExceptionFilterMsg } from '../constant/messages.constant'
import { GqlArgumentsHost } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common'

@Catch(HttpException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch (exception: HttpException, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host)

    const path = gqlHost.getInfo().fieldName
    const status = exception.getStatus()

    const errorResponse = {
      message: exception.message || ExceptionFilterMsg,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path,
    }

    throw new GraphQLError(exception.message, {
      extensions: errorResponse,
    })
  }
}
