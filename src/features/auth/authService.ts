import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import {
  Auth,
  GoogleAuthProvider,
  OAuthProvider,
  User,
  deleteUser,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from 'firebase/auth';

import { INTEGRATIONS } from '@/src/constants/integrations';
import { initializeFirebaseAuth } from '@/src/features/firebase/firebaseClient';

WebBrowser.maybeCompleteAuthSession();

export type AuthProviderLabel = 'google' | 'apple' | 'unknown';

const auth: Auth = initializeFirebaseAuth();
const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

const getProviderLabel = (user: User | null): AuthProviderLabel => {
  if (!user) {
    return 'unknown';
  }

  const providerId = user.providerData[0]?.providerId;
  if (providerId === 'google.com') {
    return 'google';
  }
  if (providerId === 'apple.com') {
    return 'apple';
  }
  return 'unknown';
};

const signInWithGoogle = async (): Promise<User> => {
  const clientId = INTEGRATIONS.firebase.googleWebClientId;
  if (!clientId) {
    throw new Error('Missing Google OAuth client ID. Set EXPO_PUBLIC_FIREBASE_GOOGLE_WEB_CLIENT_ID.');
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'moodot',
    path: 'oauthredirect',
  });
  const nonce = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const request = new AuthSession.AuthRequest({
    clientId: clientId,
    responseType: AuthSession.ResponseType.IdToken,
    redirectUri,
    scopes: ['openid', 'email', 'profile'],
    extraParams: {
      nonce,
      prompt: 'select_account',
    },
  });
  const result = await request.promptAsync(googleDiscovery);

  if (result.type !== 'success' || !result.params.id_token) {
    throw new Error('Google sign-in was cancelled.');
  }

  const credential = GoogleAuthProvider.credential(result.params.id_token);
  const response = await signInWithCredential(auth, credential);
  return response.user;
};

const signInWithApple = async (): Promise<User> => {
  if (Platform.OS !== 'ios') {
    throw new Error('Apple sign-in is available on iOS only.');
  }

  const available = await AppleAuthentication.isAvailableAsync();
  if (!available) {
    throw new Error('Apple sign-in is not available on this device.');
  }

  const credentialResponse = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credentialResponse.identityToken) {
    throw new Error('Apple sign-in returned no identity token.');
  }

  const provider = new OAuthProvider('apple.com');
  const credential = provider.credential({
    idToken: credentialResponse.identityToken,
  });

  const response = await signInWithCredential(auth, credential);
  return response.user;
};

export const authService = {
  observeAuthState(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  getProviderLabel(user: User | null): AuthProviderLabel {
    return getProviderLabel(user);
  },

  async signInForPlatform(): Promise<User> {
    if (Platform.OS === 'ios') {
      return signInWithApple();
    }
    return signInWithGoogle();
  },

  async signOut(): Promise<void> {
    await signOut(auth);
  },

  async deleteCurrentUser(): Promise<void> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No signed-in account to delete.');
    }
    await deleteUser(user);
  },
};
