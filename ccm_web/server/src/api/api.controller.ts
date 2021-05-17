import { Controller, Get } from '@nestjs/common'

import { HelloData, Globals } from './api.interfaces'
import { APIService } from './api.service'

import { LTIUserContext } from '../lti/lti.decorator'
import { LTIUserContextData } from '../lti/lti.interfaces'

@Controller('api')
export class APIController {
  constructor (private readonly apiService: APIService) {}

  @Get('hello')
  getHello (): HelloData {
    return this.apiService.getHello()
  }

  @Get('globals')
  getGlobals (@LTIUserContext() ltiUserContext: LTIUserContextData | undefined): Globals {
    return this.apiService.getGlobals(ltiUserContext)
  }
}
