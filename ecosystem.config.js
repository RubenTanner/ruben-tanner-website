// PM2 process file. Deploy by copying this whole repo to the VPS (Cyberduck
// is fine — there's no build step, nothing to compile), then from the repo
// directory on the VPS:
//
//   pm2 start ecosystem.config.js
//
// To pick up a later change after re-uploading files over Cyberduck:
//
//   pm2 restart ruben-tanner.uk
//
// PORT must match the proxy_pass port in deploy/nginx.conf.

module.exports = {
  apps: [
    {
      name: "ruben-tanner.uk",
      script: "server.js",
      cwd: __dirname,
      env: {
        PORT: 3000,
      },
      exec_mode: "fork",
      instances: 1,
      autorestart: true,
    },
  ],
};
