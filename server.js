import http from "http";
import fs from "fs";
import { WebSocketServer } from "ws";

const PORT = 3001;

const server = http.createServer((req, res) => {
  fs.readFile("./public/index.html", (err, data) => {
    if (err) {
      res.writeHead(500);
      return res.end("Error handling page");
    }
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(data);
  });
});

const wss = new WebSocketServer({ server });

wss.on("connection", (socket, req) => {
  const username = new URL(req.url, "http://localhost").searchParams.get(
    "username",
  );
  const joinMessage = {
    type: "system",
    text: `${username} joined`,
  };
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(joinMessage));
  });
  socket.on("message", (data) => {
    const { username, text } = JSON.parse(data);
    const chatMessage = {
      type: "chat",
      username,
      text,
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(chatMessage));
    });
  });
  socket.on("close", () => {
    const leaveMessage = {
      type: "system",
      text: `${username} left`,
    };
    wss.clients.forEach((client) => {
      client.send(JSON.stringify(leaveMessage));
    });
  });
});

server.listen(PORT, () => {
  console.log(`Chat server running at http://localhost:${PORT}`);
});
