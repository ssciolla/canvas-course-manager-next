export interface HelloData {
  message: string
}

export interface Globals {
  environment: 'production' | 'development'
  userContext?: {
    user: {
      loginId?: string
      hasAuthorized: boolean
    }
    course: {
      canvasId?: number
    }
    enrollmentRoles?: string[]
  }
}
