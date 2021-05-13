import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { APIModule } from './api/api.module'
import { LTIModule } from './lti/lti.module'

import { validateConfig } from './config'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: validateConfig,
      ignoreEnvFile: true,
      isGlobal: true
    }),
    LTIModule,
    AuthModule,
    APIModule
  ]
})
export class AppModule {}
