import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import {formatServerDateToLocale} from '@/utils/date-time';

interface TaskCardProps {
  title: string;
  description: string;
  dueDate: string;
  reminderTime: string;
  status: string;
  onPress: () => void;
  onDelete: () => void;
}

export default function TaskCard({
  title,
  description,
  dueDate,
  reminderTime,
  status,
  onPress,
  onDelete,
}: TaskCardProps) {
  const getStatusStyle = (taskStatus: string) => {
    switch (taskStatus) {
      case 'completed':
        return styles.completed;
      case 'pending':
        return styles.pending;
      case 'overdue':
        return styles.overdue;
      default:
        return styles.defaultStatus;
    }
  };

  return (
    <View style={styles.cardContainer}>
      <TouchableOpacity onPress={onPress} style={styles.contentContainer}>
        <Text style={styles.taskTitle}>{title}</Text>
        <Text style={styles.taskDescription}>{description}</Text>
        <Text style={styles.taskDueDate}>
          Due: {formatServerDateToLocale(dueDate)}
        </Text>
        <Text style={styles.taskReminderTime}>
          Remind At: {formatServerDateToLocale(reminderTime)}
        </Text>
        <Text
          testID={`status-text-${status}`}
          style={[styles.taskStatus, getStatusStyle(status)]}>
          Status: {status}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        testID="delete-button"
        onPress={onDelete}
        style={styles.deleteIcon}>
        <FontAwesomeIcon name="trash-o" size={25} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    position: 'relative',
  },
  contentContainer: {
    paddingRight: 30,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  taskDueDate: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  taskReminderTime: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  taskStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  completed: {
    color: 'green',
  },
  pending: {
    color: 'orange',
  },
  overdue: {
    color: 'red',
  },
  defaultStatus: {
    color: 'black',
  },
  deleteIcon: {
    position: 'absolute',
    top: 15,
    right: 18,
  },
});
