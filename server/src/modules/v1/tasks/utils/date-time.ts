import { DateTime } from "luxon";

export function validateDateConstraints(
	dueDate?: string,
	reminderTime?: string,
) {
	if (
		(dueDate && !DateTime.fromISO(dueDate).isValid) ||
		(reminderTime && !DateTime.fromISO(reminderTime).isValid)
	) {
		throw new Error("Invalid date format");
	}

	const now = DateTime.now().toUTC();
	const minDueTime = now.plus({ minutes: 2 });

	let validatedDueDate: DateTime;
	if (dueDate) {
		validatedDueDate = DateTime.fromISO(dueDate).toUTC();
		if (validatedDueDate < minDueTime) {
			validatedDueDate = minDueTime;
		}
	} else {
		validatedDueDate = now.plus({ days: 2 });
	}

	let validatedReminderTime: DateTime;
	if (reminderTime) {
		validatedReminderTime = DateTime.fromISO(reminderTime).toUTC();
		
		if (validatedReminderTime < now || validatedReminderTime >= validatedDueDate) {
			const preferredReminderTime = validatedDueDate.minus({ hours: 24 });
			
			if (preferredReminderTime > now) {
				validatedReminderTime = preferredReminderTime;
			} else {
				const timeUntilDue = validatedDueDate.diff(now).as('minutes');
				validatedReminderTime = now.plus({ minutes: Math.floor(timeUntilDue / 2) });
			}
		}
	} else {
		const preferredReminderTime = validatedDueDate.minus({ hours: 24 });
		
		if (preferredReminderTime > now) {
			validatedReminderTime = preferredReminderTime;
		} else {
			const timeUntilDue = validatedDueDate.diff(now).as('minutes');
			validatedReminderTime = now.plus({ minutes: Math.floor(timeUntilDue / 2) });
		}
	}

	return {
		newDueDate: validatedDueDate,
		newReminderTime: validatedReminderTime,
	};
}
