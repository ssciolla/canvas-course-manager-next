import { SessionData } from 'express-session'
import {
  Body, Controller, Get, HttpException, Param, ParseIntPipe, Put, Session
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'

import { HelloData, isAPIErrorData, Globals } from './api.interfaces'
import { APIService } from './api.service'
import { CourseNameDto } from './dtos/api.course.name.dto'
import { CanvasCourseBase } from '../canvas/canvas.interfaces'
import { UserService } from '../user/user.service'

@ApiBearerAuth()
@Controller('api')
export class APIController {
  constructor (private readonly apiService: APIService, private readonly userService: UserService) {}

  @Get('hello')
  getHello (): HelloData {
    return this.apiService.getHello()
  }

  @Get('globals')
  getGlobals (@Session() session: SessionData): Globals {
    return this.apiService.getGlobals(session)
  }

  @Get('course/:id/name')
  async getCourseName (
    @Param('id', ParseIntPipe) courseId: number, @Session() session: SessionData
  ): Promise<CanvasCourseBase> {
    const { userLoginId } = session.data
    const user = await this.userService.findUserByLoginId(userLoginId)
    const result = await this.apiService.getCourseName(user, courseId)
    if (isAPIErrorData(result)) throw new HttpException(result, result.statusCode)
    return result
  }

  @Put('course/:id/name')
  async putCourseName (
    @Param('id', ParseIntPipe) courseId: number, @Body() courseNameDto: CourseNameDto, @Session() session: SessionData
  ): Promise<CanvasCourseBase> {
    const { userLoginId } = session.data
    const user = await this.userService.findUserByLoginId(userLoginId)
    const result = await this.apiService.putCourseName(user, courseId, courseNameDto.newName)
    if (isAPIErrorData(result)) throw new HttpException(result, result.statusCode)
    return result
  }
}
