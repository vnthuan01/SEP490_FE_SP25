import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const HUB_URL = import.meta.env.VITE_SIGNALR_HUB_URL || '/chatHub';

let connectionSingleton: HubConnection | null = null;

export const getSignalRConnection = (): HubConnection => {
  if (connectionSingleton) return connectionSingleton;

  connectionSingleton = new HubConnectionBuilder()
    .withUrl(HUB_URL)
    .withAutomaticReconnect()
    .configureLogging(import.meta.env.DEV ? LogLevel.Information : LogLevel.Error)
    .build();

  return connectionSingleton;
};

export const startSignalRConnection = async (): Promise<HubConnection> => {
  const connection = getSignalRConnection();
  if (connection.state !== 'Connected') {
    await connection.start();
  }
  return connection;
};

export const stopSignalRConnection = async (): Promise<void> => {
  if (!connectionSingleton) return;
  if (connectionSingleton.state === 'Connected') {
    await connectionSingleton.stop();
  }
};

export type SignalREventHandler<Payload = unknown> = (payload: Payload) => void;

export const onSignalREvent = <T = unknown>(
  eventName: string,
  handler: SignalREventHandler<T>,
): (() => void) => {
  const connection = getSignalRConnection();
  connection.on(eventName, handler as SignalREventHandler);
  return () => {
    connection.off(eventName, handler as SignalREventHandler);
  };
};
