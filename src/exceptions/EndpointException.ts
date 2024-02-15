import HttpException from './HttpException'

export class EndpointException extends HttpException {
  constructor(public readonly code: number, message: string, status = 401) {
    super(status, message)
  }
}
export class EndpointNotFoundException extends EndpointException {
  constructor() {
    super(1000, 'endpoint info not found')
  }
}

export class EndpointVersionExpiredFoundException extends EndpointException {
  constructor() {
    super(1001, 'endpoint version expired')
  }
}

export class EndpointCurrentVersionNotFoundException extends EndpointException {
  constructor() {
    super(1002, 'current version not found')
  }
}

export class EndpointVersionNotValidException extends EndpointException {
  constructor() {
    super(1003, 'endpoint version not valid')
  }
}
