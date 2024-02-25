import { NextFunction, Request, Response } from 'express'
import { verfiyApikey } from '../services/application.service'
import { Application } from '../db/models'

export interface ApplicationRequest extends Request {
  authApplication: Application
}

interface ApiKeyMiddlewareOptions {
  header: string
  allowNull: boolean
}

const defaultOptions: ApiKeyMiddlewareOptions = {
  header: 'x-api-key',
  allowNull: false,
}

const apiKeyMiddleware = (
  options: Partial<ApiKeyMiddlewareOptions> = {}
): ((request: Request, response: Response, next: NextFunction) => void) => {
  const useOptions = { ...defaultOptions, ...options }

  return (request: Request, response: Response, next: NextFunction) => {
    const token = request.headers[useOptions.header]

    if (!token && useOptions.allowNull) {
      next()
      return
    }

    if (!token) {
      response.status(401).end('API-KEY needed')
      return
    }
    try {
      verfiyApikey(token as string)
        .then((app) => {
          if (!app) {
            response.status(401).end('Application not exsit')
            return
          }
          // eslint-disable-next-line @typescript-eslint/no-extra-semi
          ;(request as ApplicationRequest).authApplication = app

          next()
        })
        .catch(() => {
          response.status(401).end('Find application failed')
        })
    } catch (err) {
      response.status(401).end('Access token parse failed')
    }
  }
}

export default apiKeyMiddleware
