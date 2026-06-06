import { io, Socket } from 'socket.io-client';

interface SocketConnectionParameters {
  restaurantTenantIdentifier: string;
  employeeRoleValue: string;
  employeeAccessToken: string;
}

let socketClientSingleton: Socket | null = null;

/**
 * Initializes the Socket.IO connection and joins the role-specific room.
 * Safe to call multiple times — will not create a duplicate connection.
 */
export function connectSocketClient(
  connectionParameters: SocketConnectionParameters
): Socket {
  if (socketClientSingleton?.connected) {
    return socketClientSingleton;
  }

  const expediteHubSocketServerUrl =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

  socketClientSingleton = io(expediteHubSocketServerUrl, {
    // Pass the JWT in the handshake auth object — backend verifies this
    auth: {
      token: connectionParameters.employeeAccessToken,
    },
    transports: ['websocket'],
    autoConnect: true,
  });

  socketClientSingleton.on('connect', () => {
    // Emit the join event so the backend places us in the correct room
    socketClientSingleton!.emit('join', {
      tenantId: connectionParameters.restaurantTenantIdentifier,
      role: connectionParameters.employeeRoleValue,
    });
  });

  socketClientSingleton.on('connect_error', (socketConnectionError: Error) => {
    console.error('[SocketClient] Connection error:', socketConnectionError.message);
  });

  return socketClientSingleton;
}

/**
 * Returns the active socket instance. Returns null if not yet connected.
 */
export function getSocketClientInstance(): Socket | null {
  return socketClientSingleton;
}

/**
 * Disconnects the socket and clears the singleton.
 * Call this on logout.
 */
export function disconnectSocketClient(): void {
  if (socketClientSingleton) {
    socketClientSingleton.disconnect();
    socketClientSingleton = null;
  }
}
