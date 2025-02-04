import {useEffect, useState} from 'react';
import {Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {FlashList} from '@shopify/flash-list';
import {socket} from '@/socket';
import {useTasksQuery} from '@/hooks/api/queries/use-task-queries';
import {TaskListScreenProps} from '@/types/react-navigation';
import TaskCard from '@/components/task-card';
import Icon from 'react-native-vector-icons/FontAwesome';
import {useAuthStore} from '@/hooks/store/auth';
import {Task} from '@/types';
import {useQueryClient} from '@tanstack/react-query';
import {useDeleteTask} from '@/hooks/api/mutations/use-task-mutations';

export default function TaskListScreen({navigation}: TaskListScreenProps) {
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);
  const {accessToken} = useAuthStore();
  const {mutate: deleteTask} = useDeleteTask();

  socket.auth = {
    token: accessToken,
  };

  const {data, isSuccess} = useTasksQuery();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    if (socket.connected) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    function onTaskUpdate(_tasks: Task) {
      queryClient.invalidateQueries({queryKey: ['tasks']});
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('tasks-updates', onTaskUpdate);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('tasks-updates', onTaskUpdate);
      socket.disconnect();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Home</Text>
      <Text>Status: {isConnected ? 'connected' : 'disconnected'}</Text>

      <TouchableOpacity
        style={styles.createTaskButton}
        onPress={() => navigation.navigate('TaskCreate')}>
        <View style={styles.buttonContent}>
          <Icon name="plus" size={20} color="white" />
          <Text style={styles.buttonText}>Create Task</Text>
        </View>
      </TouchableOpacity>
      {isSuccess && (
        <FlashList
          data={data.tasks}
          renderItem={({item}) => (
            <TaskCard
              title={item.title}
              description={item.description}
              dueDate={item.dueDate}
              reminderTime={item.reminderTime}
              status={item.status}
              onDelete={() => deleteTask({taskId: item.id})}
              onPress={() => navigation.navigate('TaskEdit', {task: item})}
            />
          )}
          keyExtractor={item => item.id}
          estimatedItemSize={100}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createTaskButton: {
    backgroundColor: '#007BFF',
    marginVertical: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    marginLeft: 10,
    fontSize: 18,
  },
});
