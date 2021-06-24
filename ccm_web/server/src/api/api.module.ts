import { Module } from '@nestjs/common'

import { APIController } from './api.controller'
import { APIService } from './api.service'
import { CanvasModule } from '../canvas/canvas.module'
import { CanvasService } from '../canvas/canvas.service'
import { UserModule } from '../user/user.module'
import { UserService } from '../user/user.service'

@Module({
  imports: [CanvasModule, UserModule],
  providers: [APIService, CanvasService, UserService],
  controllers: [APIController]
})
export class APIModule {}
