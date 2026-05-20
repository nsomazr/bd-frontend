// PM2 ecosystem config for the Maisha Chat frontend.
// Serves the static Vite build (`dist/`) as a single-page app on 127.0.0.1:3090.
module.exports = {
  apps: [
    {
      name: "bd-frontend",
      cwd: "/home/happiness/blood_donation_ai/webapp/bd-frontend",
      script: "npx",
      args: "serve -s dist -l tcp://127.0.0.1:3090 --single --no-clipboard",
      interpreter: "none",
      autorestart: true,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
