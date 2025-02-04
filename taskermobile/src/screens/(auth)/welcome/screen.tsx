import {View, Text, StyleSheet, Pressable, Platform} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import {WelcomeScreenProps} from '@/types/react-navigation';

export default function WelcomeScreen({navigation}: WelcomeScreenProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.subtitle}>Welcome to Tasker</Text>
        <FontAwesome5Icon
          name="clipboard-list"
          size={160}
          color="black"
          style={styles.topIcon}
        />
      </View>
      <Pressable
        onPress={() => {
          navigation.navigate('Login');
        }}
        style={styles.button}>
        <FontAwesomeIcon
          name="rocket"
          size={20}
          color="white"
          style={styles.icon}
        />
        <Text style={styles.buttonText}>Get Started</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: '25%',
  },
  subtitle: {
    fontSize: 38,
    color: 'black',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  topIcon: {
    marginTop: 45,
  },
  button: {
    backgroundColor: 'black',
    paddingHorizontal: 105,
    paddingVertical: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 12,
  },
  buttonText: {
    fontSize: 22,
    textAlign: 'center',
    color: 'white',
    fontWeight: '500',
  },
});
