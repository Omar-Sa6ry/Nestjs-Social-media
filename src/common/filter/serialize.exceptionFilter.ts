import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
} from '@nestjs/common'
import { Response } from 'express'

@Catch(Error) // Catch any error
export class SerializationExceptionFilter implements ExceptionFilter {
  catch (exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    console.error('Serialization Error:', exception) 

    response.status(500).json({
      statusCode: 500,
      message: 'An error occurred while processing the response.',
      error: 'Serialization Error',
      details: exception.message || null,
    })
  }
}
