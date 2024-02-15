import sequelize from '../db'

export default async function env(task: () => Promise<void>): Promise<void> {
  const db = await sequelize.sync()

  await task()

  console.log('done!')
  await db.close()
}
