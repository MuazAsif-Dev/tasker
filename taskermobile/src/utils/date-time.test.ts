import {DateTime} from 'luxon';
import {
  getISOString,
  formatServerDateToLocale,
  getMinimumDateTimeFromNow,
  dateTimeConstraintsValidator,
} from './date-time';

describe('date-time utils', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-20T10:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getISOString', () => {
    it('should convert DateTime to ISO string', () => {
      const dateTime = DateTime.fromISO('2025-01-20T12:30:00.000Z');
      expect(getISOString(dateTime)).toBe('2025-01-20T12:30:00.000Z');
    });
  });

  describe('formatServerDateToLocale', () => {
    it('should format SQL date string to locale string', () => {
      const sqlDate = '2025-01-20 12:30:00';
      const result = formatServerDateToLocale(sqlDate);
      expect(result).toMatch(/Jan 20, 2025(,)? 12:30/);
    });
  });

  describe('getMinimumDateTimeFromNow', () => {
    it('should return future date based on duration', () => {
      const result = getMinimumDateTimeFromNow({hours: 2});
      const expected = new Date('2025-01-20T12:00:00.000Z');
      expect(result).toEqual(expected);
    });
  });

  describe('dateTimeConstraintsValidator', () => {
    const futureDate = '2025-01-20T14:00:00.000Z';
    const futureReminderTime = '2025-01-20T13:00:00.000Z';

    it('should return error when dates are missing', () => {
      expect(dateTimeConstraintsValidator(undefined, undefined)).toEqual({
        success: false,
        error: 'Due date and reminder time are required',
      });
    });

    it('should return error when due date is in the past', () => {
      const pastDate = '2025-01-20T09:00:00.000Z';
      expect(
        dateTimeConstraintsValidator(pastDate, futureReminderTime),
      ).toEqual({
        success: false,
        error: 'Due date must be in the future',
      });
    });

    it('should return error when reminder time is in the past', () => {
      const pastReminder = '2025-01-20T09:00:00.000Z';
      expect(dateTimeConstraintsValidator(futureDate, pastReminder)).toEqual({
        success: false,
        error: 'Reminder time must be in the future',
      });
    });

    it('should return error when reminder time is after due date', () => {
      const laterReminder = '2025-01-20T15:00:00.000Z';
      expect(dateTimeConstraintsValidator(futureDate, laterReminder)).toEqual({
        success: false,
        error: 'Reminder time must be before due date',
      });
    });

    it('should return success when constraints are met', () => {
      expect(
        dateTimeConstraintsValidator(futureDate, futureReminderTime),
      ).toEqual({
        success: true,
        data: {
          dueDate: futureDate,
          reminderTime: futureReminderTime,
        },
      });
    });
  });
});
