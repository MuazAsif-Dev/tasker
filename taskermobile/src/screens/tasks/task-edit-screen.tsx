import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import DatePicker from 'react-native-date-picker';
import {TaskEditScreenProps} from '@/types/react-navigation';
import {
  useEditTask,
  EditTaskApiRequestSchema,
  EditTaskApiRequestType,
} from '@/hooks/api/mutations/use-task-mutations';
import {useForm} from '@tanstack/react-form';
import {
  dateTimeConstraintsValidator,
  getISOString,
  getMinimumDateTimeFromNow,
} from '@/utils/date-time';
import {DateTime} from 'luxon';
import Toast from 'react-native-toast-message';
import {SafeAreaView} from 'react-native-safe-area-context';

export default function TaskEditScreen({
  navigation,
  route,
}: TaskEditScreenProps) {
  const {task} = route.params;
  const {mutate: editTask} = useEditTask();
  const [openDueDate, setOpenDueDate] = useState(false);
  const [openReminderTime, setOpenReminderTime] = useState(false);

  const form = useForm({
    defaultValues: {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate
        ? getISOString(DateTime.fromSQL(task.dueDate))
        : getISOString(DateTime.fromJSDate(new Date()).plus({days: 3})),
      reminderTime: task.reminderTime
        ? getISOString(DateTime.fromSQL(task.reminderTime))
        : getISOString(DateTime.fromJSDate(new Date()).plus({days: 1})),
      status: task.status as EditTaskApiRequestType['status'],
    },
    validators: {
      onSubmit: EditTaskApiRequestSchema,
    },
    onSubmit: async ({value}) => {
      const result = dateTimeConstraintsValidator(
        value.dueDate,
        value.reminderTime,
      );

      if (!result.success) {
        Toast.show({
          type: 'error',
          text1: result.error,
        });
        return;
      }

      const taskData = {
        ...value,
        ...result.data,
      };

      editTask({taskId: task.id, data: taskData});
      navigation.goBack();
    },
  });

  const statusOptions = [
    {label: 'Planned', value: 'planned'},
    {label: 'In Progress', value: 'in progress'},
    {label: 'Completed', value: 'completed'},
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Edit Task</Text>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Title</Text>
        <form.Field name="title">
          {field => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Task Title"
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                value={field.state.value}
              />
              {field.state.meta.errors && (
                <Text style={styles.error}>
                  {field.state.meta.errors.join(', ')}
                </Text>
              )}
            </>
          )}
        </form.Field>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description</Text>
        <form.Field name="description">
          {field => (
            <>
              <TextInput
                style={styles.input}
                placeholder="Task Description"
                onBlur={field.handleBlur}
                onChangeText={field.handleChange}
                value={field.state.value}
              />
              {field.state.meta.errors && (
                <Text style={styles.error}>
                  {field.state.meta.errors.join(', ')}
                </Text>
              )}
            </>
          )}
        </form.Field>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Due Date</Text>
        <form.Field name="dueDate">
          {field => {
            return (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setOpenDueDate(true)}>
                  <Text style={styles.buttonText}>Select Due Date</Text>
                </TouchableOpacity>
                <Text style={styles.selectedDate}>
                  Selected Date:{' '}
                  {DateTime.fromISO(
                    field.state.value ?? new Date().toISOString(),
                  ).toLocaleString(DateTime.DATETIME_MED)}
                </Text>
                <DatePicker
                  modal
                  open={openDueDate}
                  date={new Date(field.state.value ?? new Date())}
                  minimumDate={getMinimumDateTimeFromNow({minutes: 2})}
                  mode="datetime"
                  onConfirm={date => {
                    setOpenDueDate(false);
                    field.handleChange(date.toISOString());
                  }}
                  onCancel={() => {
                    setOpenDueDate(false);
                  }}
                />
                {field.state.meta.errors && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.join(', ')}
                  </Text>
                )}
              </>
            );
          }}
        </form.Field>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Reminder Time</Text>
        <form.Field name="reminderTime">
          {field => {
            return (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setOpenReminderTime(true)}>
                  <Text style={styles.buttonText}>Select Reminder Time</Text>
                </TouchableOpacity>
                <Text style={styles.selectedDate}>
                  Selected Date:{' '}
                  {DateTime.fromISO(
                    field.state.value ?? new Date().toISOString(),
                  ).toLocaleString(DateTime.DATETIME_MED)}
                </Text>
                <DatePicker
                  modal
                  open={openReminderTime}
                  date={new Date(field.state.value ?? new Date())}
                  minimumDate={getMinimumDateTimeFromNow({minutes: 1})}
                  mode="datetime"
                  onConfirm={date => {
                    setOpenReminderTime(false);
                    field.handleChange(date.toISOString());
                  }}
                  onCancel={() => {
                    setOpenReminderTime(false);
                  }}
                />
                {field.state.meta.errors && (
                  <Text style={styles.error}>
                    {field.state.meta.errors.join(', ')}
                  </Text>
                )}
              </>
            );
          }}
        </form.Field>
      </View>
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Status</Text>
        <form.Field name="status">
          {field => (
            <Dropdown
              style={styles.dropdown}
              data={statusOptions}
              labelField="label"
              valueField="value"
              placeholder="Select status"
              value={field.state.value}
              onChange={item => field.handleChange(item.value)}
            />
          )}
        </form.Field>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={() => form.handleSubmit()}>
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
  },
  fieldContainer: {
    width: '100%',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#fff',
  },
  error: {
    color: 'red',
    marginTop: 5,
  },
  selectedDate: {
    fontSize: 16,
    marginVertical: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 5,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
