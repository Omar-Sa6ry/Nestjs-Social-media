import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common'
import { instanceToPlain } from 'class-transformer'
import { Observable, map } from 'rxjs'

export class SerializeInterceptor implements NestInterceptor {
  intercept (context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map(data => instanceToPlain(data)))
  }
}
