import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
// import * as graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.js'

async function bootstrap () {
  const app = await NestFactory.create(AppModule)
  app.enableCors()
  app.useGlobalPipes(new ValidationPipe())
  // app.use(graphqlUploadExpress({ maxFileSize: 1000000, maxFiles: 5 }))
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
