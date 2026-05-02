const fs = require("fs");
const path = require("path");

const distDir = path.resolve(__dirname, "..", "dist");
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Team Task Manager</title>
    <link rel="stylesheet" href="/assets/client.css">
  </head>
  <body>
    <div id="root"></div>
    <script src="/assets/app.js"></script>
  </body>
</html>
`;

fs.writeFileSync(path.join(distDir, "index.html"), html);
