// Local SMTP sink for CRM development: accepts every message (any login) and
// saves it as an .eml file instead of delivering it. No dependencies.
// Usage: node scripts/dev-smtp.mjs [port=2525] [outDir=data/dev-mail]
import { mkdirSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";

const port = Number(process.argv[2] ?? 2525);
const outDir = path.resolve(process.argv[3] ?? "data/dev-mail");
mkdirSync(outDir, { recursive: true });

net
  .createServer((socket) => {
    let buffer = "";
    let inData = false;
    socket.write("220 dev-smtp ESMTP\r\n");
    socket.on("data", (chunk) => {
      buffer += chunk.toString("binary");
      for (;;) {
        if (inData) {
          const end = buffer.indexOf("\r\n.\r\n");
          if (end < 0) return;
          const message = buffer.slice(0, end).replace(/^\.\./gm, ".");
          buffer = buffer.slice(end + 5);
          inData = false;
          const subject = /^Subject: (.*)$/m.exec(message)?.[1] ?? "";
          const to = /^To: (.*)$/m.exec(message)?.[1] ?? "";
          const file = path.join(outDir, `${new Date().toISOString().replace(/[:.]/g, "-")}.eml`);
          writeFileSync(file, Buffer.from(message, "binary"));
          console.log(`Saved mail to ${to} (${subject}) -> ${file}`);
          socket.write("250 OK\r\n");
          continue;
        }
        const lineEnd = buffer.indexOf("\r\n");
        if (lineEnd < 0) return;
        const command = buffer.slice(0, lineEnd).slice(0, 4).toUpperCase();
        buffer = buffer.slice(lineEnd + 2);
        if (command === "EHLO") socket.write("250-dev-smtp\r\n250 AUTH PLAIN LOGIN\r\n");
        else if (command === "AUTH") socket.write("235 OK\r\n");
        // No TLS support: refuse STARTTLS so clients fail fast instead of hanging
        else if (command === "STAR") socket.write("502 STARTTLS not supported\r\n");
        else if (command === "DATA") {
          inData = true;
          socket.write("354 End data with <CR><LF>.<CR><LF>\r\n");
        } else if (command === "QUIT") {
          socket.write("221 Bye\r\n");
          socket.end();
        } else socket.write("250 OK\r\n");
      }
    });
  })
  .listen(port, () => console.log(`dev-smtp listening on ${port}, saving to ${outDir}`));
