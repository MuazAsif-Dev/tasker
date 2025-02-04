import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {LoginScreenProps} from '@/types/react-navigation';
import {useForm} from '@tanstack/react-form';
import {TextInput} from 'react-native';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {
  LoginApiRequestSchema,
  useLogin,
} from '@/hooks/api/mutations/use-auth-mutations';
import useGoogleOauth from '@/hooks/use-google-oauth';

export default function LoginScreen({navigation}: LoginScreenProps) {
  const [showPassword, setShowPassword] = useState(false);

  const {signIn} = useGoogleOauth();
  const {mutate: login, isPending: isLoginPending} = useLogin();

  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: LoginApiRequestSchema,
    },
    onSubmit: async ({value}) => {
      login(value);
    },
  });

  const signInGoogle = async () => {
    await signIn();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Log in to Tasker</Text>
        <View style={styles.formFields}>
          <View style={styles.textContainer}>
            <Text style={styles.textLabels}>Email</Text>
            <form.Field name="email">
              {field => (
                <>
                  <TextInput
                    style={styles.textInputs}
                    placeholder="hello@company.com"
                    placeholderTextColor={'gray'}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    value={field.state.value}
                    autoCapitalize="none"
                  />
                  {field.state.meta.errors ? (
                    <Text style={styles.error}>
                      {field.state.meta.errors.join(', ')}
                    </Text>
                  ) : null}
                </>
              )}
            </form.Field>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.textLabels}>Password</Text>
            <form.Field name="password">
              {field => (
                <>
                  <TextInput
                    style={styles.textInputs}
                    placeholder="Your password"
                    placeholderTextColor={'gray'}
                    onBlur={field.handleBlur}
                    onChangeText={field.handleChange}
                    value={field.state.value}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <Pressable
                    style={styles.passwordIcon}
                    onPress={() => setShowPassword(prev => !prev)}>
                    <MaterialCommunityIcon
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={24}
                      color={'black'}
                    />
                  </Pressable>
                  {field.state.meta.errors ? (
                    <Text style={styles.error}>
                      {field.state.meta.errors.join(', ')}
                    </Text>
                  ) : null}
                </>
              )}
            </form.Field>
          </View>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => form.handleSubmit()}
          disabled={isLoginPending}>
          {isLoginPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </Pressable>

        <Text style={styles.text}>OR</Text>

        <Pressable onPress={() => signInGoogle()} style={styles.googleButton}>
          <AntDesignIcon
            name="google"
            size={20}
            color="black"
            style={styles.googleIcon}
          />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            navigation.replace('Register');
          }}>
          <Text style={styles.textLink}>
            Don't have an account? Register Now
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 50,
    paddingTop: Platform.OS === 'ios' ? 80 : 50,
  },
  content: {
    gap: 45,
    width: '90%',
  },

  title: {fontSize: 30, fontWeight: '600', color: 'black'},
  text: {fontSize: 15, textAlign: 'center', fontWeight: '400', color: 'gray'},
  formFields: {
    gap: 20,
  },
  textLabels: {fontSize: 14, color: 'black', fontWeight: '500'},
  textInputs: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: 'gray',
    borderWidth: 0.5,
    borderColor: '#7F7F7F',
    width: '100%',
    borderRadius: 8,
  },
  textContainer: {
    gap: 10,
  },
  error: {fontSize: 14, color: 'red'},
  passwordIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{translateY: -12}],
  },

  button: {
    backgroundColor: 'black',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    justifyContent: 'center',
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderRadius: 10,
    borderColor: '#7F7F7F',
    borderWidth: 0.6,
  },
  googleIcon: {
    position: 'absolute',
    left: 25,
    marginRight: 10,
  },
  googleButtonText: {
    display: 'flex',
    fontSize: 16,
    alignSelf: 'stretch',
    width: '100%',
    textAlign: 'center',
    color: 'black',
    fontWeight: '500',
  },
  textLink: {
    color: '#7F7F7F',
    textAlign: 'center',
  },
});
