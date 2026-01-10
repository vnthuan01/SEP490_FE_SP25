import { memo } from 'react';
import { useSignalR } from './SignalRProvider';

function ConnectionIndicatorInner() {
  const { connectionId } = useSignalR();
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 right-4 rounded-md border px-3 py-2 text-sm shadow-md bg-white dark:bg-zinc-900"
    >
      {/* <span className={isConnected ? 'text-green-600' : 'text-red-600'}>
        {isConnected ? 'SignalR connected' : 'SignalR disconnected'}
      </span> */}
      {connectionId ? <div className="mt-1 text-xs text-zinc-500">id: {connectionId}</div> : null}
    </div>
  );
}

export const ConnectionIndicator = memo(ConnectionIndicatorInner);
