import {DateTime, DurationLike} from 'luxon';

export const getISOString = (date: DateTime) => date.toJSDate().toISOString();

export const formatServerDateToLocale = (dateString: string) => {
  return DateTime.fromSQL(dateString).toLocaleString(DateTime.DATETIME_MED);
};

export const getMinimumDateTimeFromNow = (duration: DurationLike) =>
  DateTime.now().plus(duration).toJSDate();

export function dateTimeConstraintsValidator(
  dueDate: string | undefined | null,
  reminderTime: string | undefined | null,
) {
  if (!dueDate || !reminderTime) {
    return {
      success: false,
      error: 'Due date and reminder time are required',
    } as const;
  }

  if (DateTime.fromISO(dueDate) <= DateTime.now().plus({seconds: 60})) {
    return {success: false, error: 'Due date must be in the future'} as const;
  }

  if (DateTime.fromISO(reminderTime) <= DateTime.now().plus({seconds: 30})) {
    return {
      success: false,
      error: 'Reminder time must be in the future',
    } as const;
  }

  if (
    DateTime.fromISO(reminderTime).plus({ minutes: 1 }) > DateTime.fromISO(dueDate)
  ) {
    return {
      success: false,
      error: 'Reminder time must be before due date',
    } as const;
  }

  return {
    success: true,
    data: {dueDate, reminderTime},
  } as const;
}
