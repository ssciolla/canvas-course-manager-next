import { SessionData } from 'express-session'
import { HTTPError } from 'got'
import { Injectable } from '@nestjs/common'

import { APIErrorData, Globals, HelloData } from './api.interfaces'
import { CanvasCourse, CanvasCourseBase } from '../canvas/canvas.interfaces'
import { CanvasService } from '../canvas/canvas.service'
import { User } from '../user/user.model'

import baseLogger from '../logger'

const logger = baseLogger.child({ filePath: __filename })

@Injectable()
export class APIService {
  constructor (private readonly canvasService: CanvasService) {}

  getHello (): HelloData {
    return {
      message: 'You successfully communicated with the backend server. Hooray!'
    }
  }

  getGlobals (sessionData: SessionData): Globals {
    return {
      environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
      userLoginId: sessionData.data.userLoginId,
      course: {
        id: sessionData.data.course.id,
        roles: sessionData.data.course.roles
      }
    }
  }

  static handleAPIError (error: unknown): APIErrorData {
    if (error instanceof HTTPError) {
      const { statusCode, body } = error.response
      logger.error(`Received unusual status code ${String(statusCode)}`)
      logger.error(`Response body: ${JSON.stringify(body)}`)
      return { statusCode, message: `Error(s) from Canvas: ${CanvasService.parseErrorBody(body)}` }
    } else {
      logger.error(`An error occurred while making a request to Canvas: ${JSON.stringify(error)}`)
      return { statusCode: 500, message: 'A non-HTTP error occurred while communicating with Canvas.' }
    }
  }

  async getCourseName (user: User, courseId: number): Promise<CanvasCourseBase | APIErrorData> {
    const requestor = await this.canvasService.createRequestorForUser(user, '/api/v1/')
    try {
      const endpoint = `courses/${courseId}`
      logger.debug(`Sending request to Canvas - Endpoint: ${endpoint}; Method: GET`)
      const response = await requestor.get<CanvasCourse>(endpoint)
      logger.debug(`Received response with status code ${response.statusCode}`)
      const course = response.body
      return { id: course.id, name: course.name }
    } catch (error) {
      return APIService.handleAPIError(error)
    }
  }

  async putCourseName (user: User, courseId: number, newName: string): Promise<CanvasCourseBase | APIErrorData> {
    const requestor = await this.canvasService.createRequestorForUser(user, '/api/v1/')
    try {
      const endpoint = `courses/${courseId}`
      const method = 'PUT'
      const requestBody = { course: { name: newName, course_code: newName } }
      logger.debug(
        `Sending request to Canvas - Endpoint: ${endpoint}; Method: ${method}; Body: ${JSON.stringify(requestBody)}`
      )
      const response = await requestor.requestUrl<CanvasCourse>(endpoint, method, requestBody)
      logger.debug(`Received response with status code ${response.statusCode}`)
      const course = response.body
      return { id: course.id, name: course.name }
    } catch (error) {
      return APIService.handleAPIError(error)
    }
  }
}
