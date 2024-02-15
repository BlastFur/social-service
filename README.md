# KUJI SCAN

## Develop

```
yarn
```

### ENV
```yaml
# if DEBUG=1, will show all debug logs
DEBUG=1
DB_HOST=127.0.0.1
DB_NAME=kuji-scan
DB_USER=root
DB_PASS=
PORT=8089
```

### Service

Using following command to start server.

```
yarn run start
```

### Task

Using following command to start task runner.

```
yarn run start_task
```

### Scripts

Using following command to run script.

```
yarn run script -- ./lib/scripts/__SCRIPT_NAME__.js
```

Looking for `src/scripts` folder to geet `__SCRIPT_NAME__`.
