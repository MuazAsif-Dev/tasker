import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import TaskCard from './task-card';
import {formatServerDateToLocale} from '@/utils/date-time';

jest.mock('react-native-vector-icons/FontAwesome', () => {
  return function () {
    return 'Icon';
  };
});

jest.mock('@/utils/date-time', () => ({
  formatServerDateToLocale: jest.fn(),
}));

describe('TaskCard', () => {
  const mockProps = {
    title: 'Test Task',
    description: 'Test Description',
    dueDate: '2024-03-20T10:00:00Z',
    reminderTime: '2024-03-20T09:00:00Z',
    status: 'pending',
    onPress: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (formatServerDateToLocale as jest.Mock).mockImplementation(date => date);
  });

  it('renders task details correctly', () => {
    const {getByText} = render(<TaskCard {...mockProps} />);

    expect(getByText(mockProps.title)).toBeTruthy();
    expect(getByText(mockProps.description)).toBeTruthy();
    expect(getByText(`Due: ${mockProps.dueDate}`)).toBeTruthy();
    expect(getByText(`Remind At: ${mockProps.reminderTime}`)).toBeTruthy();
    expect(getByText(`Status: ${mockProps.status}`)).toBeTruthy();
  });

  it('calls onPress when card is pressed', () => {
    const {getByText} = render(<TaskCard {...mockProps} />);

    fireEvent.press(getByText(mockProps.title));
    expect(mockProps.onPress).toHaveBeenCalledTimes(1);
  });

  it('calls onDelete when delete icon is pressed', () => {
    const {getByTestId} = render(<TaskCard {...mockProps} />);

    const deleteButton = getByTestId('delete-button');
    fireEvent.press(deleteButton);
    expect(mockProps.onDelete).toHaveBeenCalledTimes(1);
  });

  it('applies correct status styles', () => {
    const statuses = ['completed', 'pending', 'overdue'];

    statuses.forEach(status => {
      const {getByTestId} = render(<TaskCard {...mockProps} status={status} />);

      const statusElement = getByTestId(`status-text-${status}`);
      expect(statusElement.props.style).toContainEqual(
        expect.objectContaining({
          color:
            status === 'completed'
              ? 'green'
              : status === 'pending'
              ? 'orange'
              : 'red',
        }),
      );
    });
  });

  it('formats dates using formatServerDateToLocale', () => {
    render(<TaskCard {...mockProps} />);

    expect(formatServerDateToLocale).toHaveBeenCalledWith(mockProps.dueDate);
    expect(formatServerDateToLocale).toHaveBeenCalledWith(
      mockProps.reminderTime,
    );
  });
});
