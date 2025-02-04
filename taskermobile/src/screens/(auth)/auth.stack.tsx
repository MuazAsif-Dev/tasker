import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WelcomeScreen from '@/screens/(auth)/welcome/screen';
import LoginScreen from '@/screens/(auth)/login/screen';
import RegisterScreen from '@/screens/(auth)/register/screen';
import {AuthStackParamList} from '@/types/react-navigation';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStackNavigation() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
      }}>
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}
