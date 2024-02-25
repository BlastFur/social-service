// {
//   id: '1330388081006972921',
//   name: 'TEST',
//   username: 'TEEESSST',
// }
export interface TwitterUserInfo {
  id: string
  name: string
  username: string
}

// {
//   token_type: 'bearer',
//   access_token:
//     'T2VjZGpkNkw3a2lNRlFxMVZZOXNmSU94WktQQmxQdDBkbkZBWDN6WFBqZ2JmOjE2OTcwMTQ2OTAzMDQ6MToxOmF0OjE',
//   scope: 'users.read follows.read tweet.read',
//   expires_at: 1697021890370,
// }
export interface TwitterToken {
  [key: string]: any
  expires_at: number
}
