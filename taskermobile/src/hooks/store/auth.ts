import {create} from 'zustand';

type ActionType = {
  actions: {
    setAccessToken: (accessToken: AuthType['accessToken']) => void;
    setFcmToken: (fcmToken: AuthType['fcmToken']) => void;
  };
};

type AuthType = {
  accessToken: string | null;
  fcmToken: string | null;
};

export const useAuthStore = create<AuthType & ActionType>(set => ({
  accessToken: null,
  fcmToken: null,
  actions: {
    setAccessToken: accessToken => {
      set({accessToken});
    },
    setFcmToken: fcmToken => {
      set({fcmToken});
    },
  },
}));

export const useIsAuthenticated = () =>
  useAuthStore(state => !!state.accessToken);

export const useAuthActions = () => useAuthStore(state => state.actions);
