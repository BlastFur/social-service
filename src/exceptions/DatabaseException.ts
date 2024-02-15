import HttpException from './HttpException'

export class DatabaseException extends HttpException {
  constructor(message = 'database error') {
    super(500, message)
  }
}

export class DatabaseCreateException extends DatabaseException {
  constructor(id = 'Entity', extra?: string) {
    super(`${id} create fail${extra ? ': ' + extra : ''}`)
  }
}

export class DatabaseModifyException extends DatabaseException {
  constructor(id = 'Entity', extra?: string) {
    super(`${id} modify fail${extra ? ': ' + extra : ''}`)
  }
}

export class DatabaseDeleteException extends DatabaseException {
  constructor(id = 'Entity', extra?: string) {
    super(`${id} delete fail${extra ? ': ' + extra : ''}`)
  }
}

export class DatabaseQueryException extends DatabaseException {
  constructor(message = 'database query error') {
    super(message)
  }
}
