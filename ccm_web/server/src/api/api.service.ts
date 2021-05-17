import { Injectable } from '@nestjs/common'

import { Globals, HelloData } from './api.interfaces'
import { LTIUserContextData } from '../lti/lti.interfaces'

@Injectable()
export class APIService {
  getHello (): HelloData {
    return {
      message: 'You successfully communicated with the backend server. Hooray!'
    }
  }

  getGlobals (userContext: LTIUserContextData | undefined): Globals {
    // TO DO: determine using DB whether user has initiated OAuth flow, we've minted a token

    let userContextExpanded
    if (userContext !== undefined) {
      const user = {
        loginId: userContext.user.loginId,
        hasAuthorized: false
      }
      const course = {
        canvasId: userContext.course.canvasId
      }
      const enrollmentRoles = userContext.enrollmentRoles
      userContextExpanded = { user, course, enrollmentRoles }
    }

    return {
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      userContext: userContextExpanded
    }
  }
}
