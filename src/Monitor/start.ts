import Monitor from '.'

const monitor = new Monitor()

monitor
  .init()
  .then(async () => {
    await monitor.start()
  })
  .catch((e) => console.error(e))
