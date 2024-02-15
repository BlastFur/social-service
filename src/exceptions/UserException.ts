import HttpException from './HttpException'

export class UserException extends HttpException {
  constructor(message = 'user error', code = 500) {
    super(code, message)
  }
}

export class NeedUserException extends UserException {
  constructor() {
    super('need user', 401)
  }
}

export class UserVerifyFailException extends UserException {
  constructor(account = 'Account', extra?: string) {
    super(`${account} verify fail${extra ? ': ' + extra : ''}`, 401)
  }
}
