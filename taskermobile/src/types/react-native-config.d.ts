declare module 'react-native-config' {
  export interface NativeConfig {
    NODE_ENV?: string;
    ANDROID_API_URL?: string;
    IOS_API_URL?: string;
    API_URL?: string;
    API_SOCKET_URL?: string;
    GOOGLE_WEB_CLIENT_ID?: string;
    GOOGLE_ANDROID_CLIENT_ID?: string;
    GOOGLE_IOS_CLIENT_ID?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
