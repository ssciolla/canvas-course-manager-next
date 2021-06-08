import 'express-session'

declare module 'express-session' {
  interface CustomData {
    ltiKey: string
    userLoginId: string
    apiBaseURL: string
  }

  interface SessionData {
    data: CustomData
  }
}
