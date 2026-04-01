import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

type Entity = { id: string; x: number; y: number; hp: number; name: string };

export function App() {
  const [players, setPlayers] = useState<Record<string, Entity>>({});
  const [me, setMe] = useState<string>('');
  const [messages, setMessages] = useState<string[]>([]);
  const serverUrl = import.meta.env.VITE_GAME_SERVER_URL ?? 'http://localhost:4000';
  const socket = useMemo(() => io(serverUrl), [serverUrl]);
  const viewRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    socket.on('snapshot', (data: { you: string; players: Record<string, Entity> }) => {
      setMe(data.you);
      setPlayers(data.players);
    });
    socket.on('chat', (msg: string) => setMessages((m) => [...m.slice(-20), msg]));
    return () => socket.disconnect();
  }, [socket]);

  useEffect(() => {
    const render = () => {
      const canvas = viewRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#10211b';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      Object.values(players).forEach((p) => {
        ctx.fillStyle = p.id === me ? '#7fffd4' : '#d4b483';
        ctx.fillRect(p.x, p.y, 14, 14);
        ctx.fillStyle = '#fff';
        ctx.fillText(p.name, p.x - 4, p.y - 6);
      });
      requestAnimationFrame(render);
    };
    render();
  }, [players, me]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => socket.emit('move', e.key);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [socket]);

  return (
    <div className="layout">
      <canvas ref={viewRef} width={720} height={420} className="game" />
      <aside>
        <h1>Aetherfall Realms</h1>
        <p>Zone: Hearthmere Crossing</p>
        <div className="panel"><b>Skills</b><p>Bladecraft 1, Wildcraft 1, Arcanum 1</p></div>
        <div className="panel"><b>Quest Log</b><p>Embers in the Bramble (0/5 Cinderlings)</p></div>
        <div className="panel"><b>Chat</b>{messages.map((m, i) => <p key={i}>{m}</p>)}</div>
      </aside>
    </div>
  );
}
