import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'
import { CustomExceptionFilter } from '../filter/global.exceptionFilter'

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      context: ({ req }) => ({ req }),
      playground: true,
      uploads: true,
      // Exception Filter
      debug: false,
      formatError: error => {
        const originalerror = error.extensions.originalError || {}
        
        return {
          ...originalerror,
          message: error.message,
          timestamp: new Date().toISOString(),
          path: error.path,
        }
      },
    }),
  ],
})
export class GraphqlModule {}
