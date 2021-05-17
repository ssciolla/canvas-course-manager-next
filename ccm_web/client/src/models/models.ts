/*
Interfaces for common objects and entities (e.g. Globals, Course, Section, etc.)
*/

export interface User {
  loginId?: string
  hasAuthorized: boolean
}

export interface Course {
  id?: number
}

export interface Globals {
  environment: 'production' | 'development'
  userContext?: {
    user: User
    course: Course
    enrollmentRoles?: string[]
  }
}

export interface HelloMessageData {
  message: string
}
