export const config = {
  // 4848 is the default port for the zero cache
  // but localhost is not supported in android
  // you need to change it to your zero cache server's IP address
  zeroCacheUrl:
    process.env.EXPO_PUBLIC_ZERO_CACHE_URL ?? "http://localhost:4848",
  // 3000 is the default port for the API server
  // but localhost is not supported in android
  // you need to change it to your API server's IP address
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
} as const;
