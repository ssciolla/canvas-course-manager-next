import { Response } from 'express'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { LTIUserContextData } from './lti.interfaces'

export const LTIUserContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): LTIUserContextData | undefined => {
    const response = ctx.switchToHttp().getResponse<Response>()
    if (response.locals.token !== undefined) {
      const token = response.locals.token
      const custom = token.platformContext.custom

      const loginId = custom.login_id !== undefined
        ? custom.login_id as string
        : undefined

      const courseId = custom.course_id !== undefined
        ? custom.course_id as number
        : undefined

      let enrollmentRoles: string[] | undefined
      if (custom.roles !== undefined) {
        const rolesString = custom.roles as string
        enrollmentRoles = rolesString.split(',')
      }

      return {
        user: { loginId, ltiId: token.user },
        course: { canvasId: courseId },
        enrollmentRoles: enrollmentRoles
      }
    }
  }
)
