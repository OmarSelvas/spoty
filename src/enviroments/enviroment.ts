export const environment = {
  production: false,
  spotifyClientId: 'TU_CLIENT_ID_AQUI',
  spotifyRedirectUri: 'http://localhost:4200/callback',
  spotifyScopes: [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'streaming',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-public',
    'playlist-modify-private'
  ].join(' ')
};