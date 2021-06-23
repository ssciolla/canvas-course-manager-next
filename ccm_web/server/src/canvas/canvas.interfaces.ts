import { hasKeys } from '../typeUtils'

// OAuth

export interface OAuthResponseQuery {
  code: string
  state: string
}

interface TokenBaseResponseBody {
  access_token: string
  token_type: 'Bearer'
  user: {
    id: number
    name: string
    global_id: string
    effective_locale: string
  }
  expires_in: number
}

export interface TokenCodeResponseBody extends TokenBaseResponseBody {
  refresh_token: string
}

export interface TokenRefreshResponseBody extends TokenBaseResponseBody {}

// Entities

export interface CanvasCourseBase {
  id: number
  name: string
}

export interface CanvasCourse extends CanvasCourseBase {
  course_code: string
}

// Errors

interface CanvasError {
  message: string
}

function isCanvasError (value: unknown): value is CanvasError {
  return hasKeys(value, ['message'])
}

export interface CanvasErrorBody {
  errors: CanvasError[]
}

export function isCanvasErrorBody (value: unknown): value is CanvasErrorBody {
  if (!hasKeys(value, ['errors']) || !Array.isArray(value.errors)) {
    return false
  } else {
    const result = value.errors.map(e => isCanvasError(e)).every(e => e)
    return result
  }
}
