import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { CustomExceptionFilter } from './common/filter/global.exceptionFilter'
import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  app.useGlobalFilters(new CustomExceptionFilter())
  app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 5 }))

  const config = new DocumentBuilder()
    .setTitle('Push Notification')
    .setDescription(
      'The API details of the business solution for the Push Notification Demo Application.',
    )
    .setVersion('1.0')
    .addTag('Notification')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)

  await app.listen(process.env.PORT)
}

bootstrap()
