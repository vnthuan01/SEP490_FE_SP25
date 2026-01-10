import { useEffect, useState } from 'react';
import { useSignalR } from './SignalRProvider';

export function MessageDemo() {
  const { connection } = useSignalR();
  const [messageA, setMessageA] = useState('');
  const [messageB, setMessageB] = useState('');

  useEffect(() => {
    if (!connection) return;
    const offA = (payload: string) => setMessageA(payload);
    const offB = (payload: string) => setMessageB(payload);

    connection.on('messageForA', offA);
    connection.on('messageForB', offB);

    return () => {
      connection.off('messageForA', offA);
      connection.off('messageForB', offB);
    };
  }, [connection]);

  return (
    <div className="space-y-2">
      <div className="rounded border p-3">A: {messageA}</div>
      <div className="rounded border p-3">B: {messageB}</div>
    </div>
  );
}
