export const getUserStorage = () => {
  return {
    users: [],
    addUserToStorage: (email, password) => {
      if (typeof email === "string" && typeof password === "string") {
        UserStorage.users.push({ email, password });
      }
    },
    findUserByEmail: (email) => {
      if (typeof email === "string") {
        return UserStorage.users.find((user) => user.email === email);
      }
      return null;
    },
  };
};

export const getBookingStorage = () => {
  return {
    bookings: [],
    addBookingToStorage: (userEmail, hotel) => {
      if (typeof userEmail === "string" && typeof hotel === "string") {
        BookingStorage.bookings.push({ userEmail, hotel });
      }
    },
    getBookingsByEmail: (userEmail) => {
      if (typeof userEmail === "string") {
        return BookingStorage.bookings.filter(
          (booking) => booking.userEmail === userEmail
        );
      }
      return null;
    },
    getBookingsByHotel: (hotel) => {
      if (typeof hotel === "string") {
        return BookingStorage.bookings.filter(
          (booking) => booking.hotel === hotel
        );
      }
      return null;
    },
    getBooking: (userEmail, hotel) => {
      if (typeof userEmail === "string" && typeof hotel === "string") {
        return BookingStorage.bookings.find(
          (booking) =>
            booking.userEmail === userEmail && booking.hotel === hotel
        );
      }
      return null;
    },
  };
};
