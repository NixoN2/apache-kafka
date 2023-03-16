export const getStatisticsService = () => {
  return {
    statistics: {
      users: 0,
      bookings: 0,
      usersSearch: 0,
      userSearch: 0,
      bookingsByEmailSearch: 0,
      bookingsByHotelSearch: 0,
      bookingsSearch: 0,
      bookingSearch: 0,
    },
    updateStatistics: (field) => {
      if (field in StatisticsService.statistics) {
        StatisticsService.statistics[field] += 1;
      }
    },
  };
};

export const getLoggingService = () => {
  return {
    logMessage: (message) => {
      console.log(message);
    },
  };
};
