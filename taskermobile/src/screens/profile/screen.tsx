import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {useAuthActions} from '@/hooks/store/auth';
import {useUserQuery} from '@/hooks/api/queries/use-user-queries';
import useGoogleOauth from '@/hooks/use-google-oauth';

export default function ProfileScreen() {
  const {setAccessToken} = useAuthActions();
  const {data, isError, isSuccess} = useUserQuery();
  const {signOut} = useGoogleOauth();

  return (
    <View style={styles.container}>
      {isSuccess && (
        <>
          <Text style={styles.name}>{data.user.name}</Text>
          <Text style={styles.email}>{data.user.email}</Text>
        </>
      )}
      {isError && <Text style={styles.error}>Error loading user data</Text>}
      <Pressable
        onPress={() => {
          signOut();
          setAccessToken(null);
        }}
        style={({pressed}) => [
          styles.logoutButton,
          pressed && styles.logoutButtonPressed,
        ]}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  email: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  error: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    elevation: 0,
  },
  logoutButtonPressed: {
    backgroundColor: '#0056b3',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
