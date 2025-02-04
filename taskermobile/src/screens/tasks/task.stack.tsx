import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import TaskListScreen from './task-list.screen';
import TaskCreateScreen from './task-create-screen';
import TaskEditScreen from './task-edit-screen';
import {TaskStackParamList} from '@/types/react-navigation';

const TaskStack = createNativeStackNavigator<TaskStackParamList>();

export default function TaskStackNavigation() {
  return (
    <TaskStack.Navigator
      initialRouteName="TaskList"
      screenOptions={{
        headerShown: false,
        animation: 'simple_push',
      }}>
      <TaskStack.Screen name="TaskList" component={TaskListScreen} />
      <TaskStack.Screen name="TaskCreate" component={TaskCreateScreen} />
      <TaskStack.Screen name="TaskEdit" component={TaskEditScreen} />
    </TaskStack.Navigator>
  );
}
