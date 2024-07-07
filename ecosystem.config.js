module.exports = {
  apps : [{
    name: "MoccaBot",
    script: "ts-node ./index.ts",
    cron_restart: "*/15 * * * *"
  }]
};