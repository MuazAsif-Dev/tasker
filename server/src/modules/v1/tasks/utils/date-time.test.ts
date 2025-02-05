import { DateTime } from "luxon";
import { describe, expect, test, beforeEach,afterEach, vi } from "vitest";
import { validateDateConstraints } from "./date-time.js";

describe("validateDateConstraints", () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2025-02-01T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test("Both dueDate and reminderTime are provided and valid", () => {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			"2025-02-05T12:00:00Z",
			"2025-02-04T12:00:00Z",
		);
		expect(newDueDate.toISO()).toBe("2025-02-05T12:00:00.000Z");
		expect(newReminderTime.toISO()).toBe("2025-02-04T12:00:00.000Z");
	});

	test("No reminder time provided", () => {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			"2025-02-05T12:00:00Z",
		);
		expect(newDueDate.toISO()).toBe("2025-02-05T12:00:00.000Z");
		expect(newReminderTime.toISO()).toBe("2025-02-04T12:00:00.000Z");
	});

	test("No due date provided", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints();
		expect(newDueDate.toISO()).toBe(now.plus({ days: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(
			now.plus({ days: 1 }).toISO(),
		);
	});

	test("reminderTime is after dueDate", () => {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			"2025-02-05T12:00:00Z",
			"2025-02-06T12:00:00Z",
		);
		expect(newDueDate.toISO()).toBe("2025-02-05T12:00:00.000Z");
		expect(newReminderTime.toISO()).toBe("2025-02-04T12:00:00.000Z");
	});

	test("dueDate and reminderTime are the same", () => {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			"2025-02-05T12:00:00Z",
			"2025-02-05T12:00:00Z",
		);
		expect(newDueDate.toISO()).toBe("2025-02-05T12:00:00.000Z");
		expect(newReminderTime.toISO()).toBe("2025-02-04T12:00:00.000Z");
	});

	test("dueDate is very close to current time", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.plus({ minutes: 1 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ minutes: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 1 }).toISO());
	});

	test("dueDate missing, reminderTime provided", () => {
		const now = DateTime.now().toUTC();
		const futureReminderTime = now.plus({ days: 1 }).set({ 
			hour: 12, 
			minute: 0, 
			second: 0, 
			millisecond: 0 
		});
		
		const { newDueDate, newReminderTime } = validateDateConstraints(
			undefined,
			futureReminderTime.toISO()
		);
		
		expect(newDueDate.toISO()).toBe(now.plus({ days: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(futureReminderTime.toISO());
	});

	test("dueDate provided, reminderTime missing", () => {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			"2025-02-10T15:00:00Z",
		);
		expect(newDueDate.toISO()).toBe("2025-02-10T15:00:00.000Z");
		expect(newReminderTime.toISO()).toBe("2025-02-09T15:00:00.000Z");
	});

	test("dueDate in the past", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.minus({ hours: 1 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ minutes: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 1 }).toISO());
	});

	test("reminderTime in the past", () => {
		const now = DateTime.now().toUTC();
		const futureDueDate = now.plus({ minutes: 10 });
		const { newDueDate, newReminderTime } = validateDateConstraints(
			futureDueDate.toISO(),
			now.minus({ hours: 1 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(futureDueDate.toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 5 }).toISO());
	});

	test("invalid date formats", () => {
		expect(() =>
			validateDateConstraints("2025-02-05 12:00:00", "2025-02-04T12:00:00Z"),
		).toThrow("Invalid date format");

		expect(() =>
			validateDateConstraints("2025-02-05T12:00:00Z", "tomorrow at noon"),
		).toThrow("Invalid date format");
	});

	test("dueDate very close to now with provided reminderTime", () => {
		const now = DateTime.now().toUTC();
		const dueDate = now.plus({ minutes: 1 });
		const reminderTime = now.minus({ minutes: 5 });
		const { newDueDate, newReminderTime } = validateDateConstraints(
			dueDate.toISO(),
			reminderTime.toISO(),
		);
		
		const expectedDueDate = now.plus({ minutes: 2 });
		const expectedReminderTime = now.plus({ minutes: 1 });
		
		expect(newDueDate.diff(expectedDueDate).as('milliseconds')).toBeLessThan(10);
		expect(newDueDate.diff(expectedDueDate).as('milliseconds')).toBeLessThan(10);
		expect(newReminderTime.diff(expectedReminderTime).as('milliseconds')).toBeLessThan(10);
	});

	test("dueDate exactly 2 minutes from now", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.plus({ minutes: 2 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ minutes: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 1 }).toISO());
	});

	test("dueDate exactly 2 minutes from now with reminderTime 1 minute from now", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.plus({ minutes: 2 }).toISO(),
			now.plus({ minutes: 1 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ minutes: 2 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 1 }).toISO());
	});

	test("dueDate 3 minutes from now with reminderTime 2.5 minutes from now", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.plus({ minutes: 3 }).toISO(),
			now.plus({ minutes: 2, seconds: 30 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ minutes: 3 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 2, seconds: 30 }).toISO());
	});

	test("dueDate 24 hours and 1 minute from now", () => {
		const now = DateTime.now().toUTC();
		const { newDueDate, newReminderTime } = validateDateConstraints(
			now.plus({ hours: 24, minutes: 1 }).toISO(),
		);
		expect(newDueDate.toISO()).toBe(now.plus({ hours: 24, minutes: 1 }).toISO());
		expect(newReminderTime.toISO()).toBe(now.plus({ minutes: 1 }).toISO());
	});

	test("dueDate and reminderTime with millisecond precision", () => {
		const now = DateTime.now().toUTC();
		const dueDate = now.plus({ minutes: 5, milliseconds: 500 });
		const reminderTime = now.plus({ minutes: 3, milliseconds: 250 });
		const { newDueDate, newReminderTime } = validateDateConstraints(
			dueDate.toISO(),
			reminderTime.toISO(),
		);
		expect(newDueDate.toISO()).toBe(dueDate.toISO());
		expect(newReminderTime.toISO()).toBe(reminderTime.toISO());
	});

	test("reminderTime exactly equal to current time", () => {
		const now = DateTime.now().toUTC();
		const dueDate = now.plus({ minutes: 10 });
		const { newDueDate, newReminderTime } = validateDateConstraints(
			dueDate.toISO(),
			now.toISO(),
		);
		
		expect(newDueDate.diff(dueDate).as('milliseconds')).toBeLessThan(10);
		
		const preferredReminderTime = dueDate.minus({ hours: 24 });
		const expectedReminderTime = preferredReminderTime > now 
			? preferredReminderTime 
			: now.plus({ minutes: Math.floor(dueDate.diff(now).as('minutes') / 2) });
		
		expect(newReminderTime.diff(expectedReminderTime).as('milliseconds')).toBeLessThan(10);
	});

	test("extremely far future dates", () => {
		const farFuture = "9999-12-31T23:59:59Z";
		const { newDueDate, newReminderTime } = validateDateConstraints(farFuture);
		expect(newDueDate.toISO()).toBe("9999-12-31T23:59:59.000Z");
		expect(newReminderTime.toISO()).toBe("9999-12-30T23:59:59.000Z");
	});
});
