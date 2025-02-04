import React from 'react';
import {render} from '@testing-library/react-native';
import {NavigationContainer} from '@react-navigation/native';
import RootNavigation from './root';
import {useIsAuthenticated} from '@/hooks/store/auth';

jest.mock('@/hooks/store/auth', () => ({
  useIsAuthenticated: jest.fn(),
}));

const mockNavigator = jest.fn();
const mockScreen = jest.fn();

jest.mock('@react-navigation/bottom-tabs', () => {
  const {Text} = require('react-native');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({screenOptions, children}: any) => {
        mockNavigator({screenOptions});
        return <Text>Navigation: {children}</Text>;
      },
      Screen: ({name, component, options}: any) => {
        mockScreen({name, component, options});
        return null;
      },
    }),
  };
});

jest.mock('@/screens/(auth)/auth.stack', () => {
  const {View, Text} = require('react-native');
  return () => (
    <View testID="auth-stack">
      <Text>Auth Stack</Text>
    </View>
  );
});

jest.mock('@/screens/tasks/task.stack', () => {
  const {View, Text} = require('react-native');
  return () => (
    <View testID="task-stack">
      <Text>Task Stack</Text>
    </View>
  );
});

jest.mock('@/screens/profile/screen', () => {
  const {View, Text} = require('react-native');
  return () => (
    <View testID="profile-screen">
      <Text>Profile Screen</Text>
    </View>
  );
});

jest.mock('react-native-vector-icons/AntDesign', () => 'AntDesignIcon');

const renderWithNavigation = (component: React.ReactElement) => {
  return render(<NavigationContainer>{component}</NavigationContainer>);
};

describe('RootNavigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders auth stack when user is not authenticated', () => {
    (useIsAuthenticated as jest.Mock).mockReturnValue(false);

    const {getByTestId} = renderWithNavigation(<RootNavigation />);
    expect(getByTestId('auth-stack')).toBeTruthy();
  });

  it('renders tab navigation when user is authenticated', () => {
    (useIsAuthenticated as jest.Mock).mockReturnValue(true);

    renderWithNavigation(<RootNavigation />);

    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Home',
      }),
    );
    expect(mockScreen).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Profile',
      }),
    );

    expect(mockNavigator).toHaveBeenCalledWith(
      expect.objectContaining({
        screenOptions: expect.objectContaining({
          headerShown: false,
        }),
      }),
    );
  });
});
