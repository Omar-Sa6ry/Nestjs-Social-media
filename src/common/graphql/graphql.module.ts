import { ApolloDriver } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'path'

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
        const { originalError } = error.extensions || {}

        return {
          ...originalError,
          message: error.message,
          timestamp: new Date().toISOString(),
          path: error.path,
        }
      },
    }),
  ],
})
export class GraphqlModule {}
