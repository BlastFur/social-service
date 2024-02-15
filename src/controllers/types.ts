import { Router } from 'express'

export interface Controller {
  path: string
  router: Router
}

export interface Pagination {
  page: string
  count: string
}

export interface PaginationResponse<T> {
  data: T[]
  total: number
  page: number
  count: number
}
