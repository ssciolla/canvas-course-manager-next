export interface LTIUserContextData {
  user: {
    ltiId: string
    loginId?: string
  }
  course: {
    canvasId?: number
  }
  enrollmentRoles?: string[]
}
