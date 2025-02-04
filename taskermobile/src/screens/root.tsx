import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import ProfileScreen from '@/screens/profile/screen';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {useIsAuthenticated} from '@/hooks/store/auth';
import AuthStackNavigation from '@/screens/(auth)/auth.stack';
import {Platform} from 'react-native';
import TaskStackNavigation from '@/screens/tasks/task.stack';

const Tab = createBottomTabNavigator();

const HomeTabBarIcon = ({color}: {color: string}) => (
  <AntDesignIcon name="home" size={24} color={color} />
);
const ProfileTabBarIcon = ({color}: {color: string}) => (
  <AntDesignIcon name="user" size={24} color={color} />
);

function RootTabNavigation() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {fontSize: 14},
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 85 : 60,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={TaskStackNavigation}
        options={{
          tabBarIcon: HomeTabBarIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ProfileTabBarIcon,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigation() {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    return <AuthStackNavigation />;
  }

  return <RootTabNavigation />;
}
