import { Observable, throwError } from 'rxjs'
import { map, catchError } from 'rxjs/operators'
import { GraphQLError } from 'graphql'
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'

@Injectable()
export class GeneralResponseInterceptor<T> implements NestInterceptor<T, any> {
  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        return {
          success: true,
          statusCode: data.statusCode || 200,
          message: data.message || 'Request successful',
          timeStamp: new Date().toISOString().split('T')[0],
          pagination: data.pagination,
          items: Array.isArray(data.items) ? data.items : data?.data.items,
          data: Array.isArray(data) ? data : data?.data,
        }
      }),

      catchError(error => {
        return throwError(
          () =>
            new GraphQLError(error.message || 'An error occurred', {
              extensions: {
                success: false,
                statusCode: error.status,
                message: error.message || 'An error occurred',
                timeStamp: new Date().toISOString().split('T')[0],
                error: error.response.error,
              },
            }),
        )
      }),
    )
  }
}
