import cors from 'cors';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

const http = createServer(app);
const io = new Server(http, { cors: { origin: '*' } });

type Player = { id: string; name: string; x: number; y: number; hp: number };
const players: Record<string, Player> = {};

io.on('connection', (socket) => {
  players[socket.id] = { id: socket.id, name: `Wanderer-${socket.id.slice(0, 4)}`, x: 100, y: 100, hp: 100 };
  io.emit('chat', `${players[socket.id].name} entered Hearthmere.`);

  socket.on('move', (key: string) => {
    const p = players[socket.id];
    if (!p) return;
    const speed = 8;
    if (key === 'ArrowUp' || key === 'w') p.y -= speed;
    if (key === 'ArrowDown' || key === 's') p.y += speed;
    if (key === 'ArrowLeft' || key === 'a') p.x -= speed;
    if (key === 'ArrowRight' || key === 'd') p.x += speed;
  });

  socket.on('disconnect', () => {
    const name = players[socket.id]?.name;
    delete players[socket.id];
    if (name) io.emit('chat', `${name} vanished into the mist.`);
  });
});

setInterval(() => {
  for (const id in players) {
    io.to(id).emit('snapshot', { you: id, players });
  }
}, 100);

app.get('/health', (_req, res) => res.json({ ok: true, service: 'aetherfall-server' }));

http.listen(4000, () => console.log('Aetherfall server on :4000'));
