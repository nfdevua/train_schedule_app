export const validationUtils = {
  validateTimeRange: (
    departureTime: string,
    arrivalTime: string
  ): string | null => {
    if (!departureTime || !arrivalTime) {
      return null;
    }

    const departure = new Date(departureTime);
    const arrival = new Date(arrivalTime);

    if (isNaN(departure.getTime()) || isNaN(arrival.getTime())) {
      return "Please enter valid dates and times";
    }

    if (arrival <= departure) {
      return "Arrival time must be after departure time";
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    if (departure > oneYearFromNow) {
      return "Departure time cannot be more than 1 year in the future";
    }

    if (arrival > oneYearFromNow) {
      return "Arrival time cannot be more than 1 year in the future";
    }

    return null;
  },

  validateRouteTimes: (
    departureTime: string,
    arrivalTime: string
  ): string | null => {
    const timeRangeError = validationUtils.validateTimeRange(
      departureTime,
      arrivalTime
    );
    if (timeRangeError) {
      return timeRangeError;
    }

    return null;
  },

  validatePrice: (price: number): string | null => {
    if (price < 0) {
      return "Price cannot be negative";
    }
    if (price > 10000) {
      return "Price cannot exceed $10,000";
    }
    return null;
  },

  validateSeats: (seats: number): string | null => {
    if (seats < 1) {
      return "Available seats must be at least 1";
    }
    if (seats > 1000) {
      return "Available seats cannot exceed 1,000";
    }
    return null;
  },

  validateTrainNumber: (trainNumber: string): string | null => {
    if (!trainNumber.trim()) {
      return "Train number is required";
    }
    if (trainNumber.length < 2) {
      return "Train number must be at least 2 characters";
    }
    if (trainNumber.length > 20) {
      return "Train number cannot exceed 20 characters";
    }
    return null;
  },

  validateStationName: (
    stationName: string,
    fieldName: string
  ): string | null => {
    if (!stationName.trim()) {
      return `${fieldName} is required`;
    }
    if (stationName.length < 2) {
      return `${fieldName} must be at least 2 characters`;
    }
    if (stationName.length > 100) {
      return `${fieldName} cannot exceed 100 characters`;
    }
    return null;
  },
};
