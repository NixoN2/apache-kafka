import express from "express";
import bodyParser from "body-parser";
import { getUserStorage, getBookingStorage } from "./storage/index.js";
import { getLoggingService, getStatisticsService } from "./services/index.js";
import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "booking-service",
  brokers: ["0.0.0.0:9092", "0.0.0.0:9092"],
});

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

global.UserStorage = getUserStorage();
global.BookingStorage = getBookingStorage();
global.StatisticsService = getStatisticsService();
global.LoggingService = getLoggingService();

const sendMessage = async (topic, message) => {
  const producer = kafka.producer();
  await producer.connect();
  await producer.send({
    topic,
    messages: [message],
  });
  await producer.disconnect();
};

const UserConsumer = kafka.consumer({ groupId: "users" });

await UserConsumer.connect();
await UserConsumer.subscribe({
  topics: ["user_logs", "user_statistics"],
});

await UserConsumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    if (topic === "user_logs") {
      LoggingService.logMessage("users consumer |" + message.value);
    }
    if (topic === "user_statistics") {
      StatisticsService.updateStatistics(message.value);
    }
  },
});

const BookingsConsumer = kafka.consumer({ groupId: "bookings" });

await BookingsConsumer.connect();
await BookingsConsumer.subscribe({
  topics: ["bookings_logs", "bookings_statistics"],
});

await BookingsConsumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    if (topic === "bookings_logs") {
      LoggingService.logMessage("bookings consumer |" + message.value);
    }
    if (topic === "bookings_statistics") {
      StatisticsService.updateStatistics(message.value);
    }
  },
});

app.post("/user", async (req, res) => {
  const { body } = req;
  if (body.email && body.password) {
    UserStorage.addUserToStorage(body.email, body.password);
    await sendMessage("user_statistics", {
      value: "users",
    });
    await sendMessage("user_logs", {
      value: `user ${body.email} was created`,
    });
    return res.status(200).json({ message: "created" });
  }
  return res
    .status(400)
    .json({ message: "email or password were not provided" });
});

app.get("/user", async (req, res) => {
  const { body } = req;
  if (body.email) {
    const user = UserStorage.findUserByEmail(body.email);
    if (user) {
      await sendMessage("user_statistics", {
        value: "userSearch",
      });
      await sendMessage("user_logs", {
        value: `user ${body.email} was found`,
      });
      return res.status(200).send(user);
    }
    return res.status(404).send({ message: "user not found" });
  }
  return res.status(400).send({ message: "email was not provided" });
});

app.get("/users", async (req, res) => {
  await sendMessage("user_statistics", {
    value: "usersSearch",
  });
  await sendMessage("user_logs", {
    value: `users were found`,
  });
  res.status(200).json({ users: UserStorage.users });
});

app.post("/booking", async (req, res) => {
  const { body } = req;
  if (body.userEmail && body.hotel) {
    BookingStorage.addBookingToStorage(body.userEmail, body.hotel);
    await sendMessage("bookings_statistics", {
      value: "bookings",
    });
    await sendMessage("bookings_logs", {
      value: `booking for hotel ${body.hotel} by user ${body.userEmail} created`,
    });
    return res.status(200).json({ message: "created" });
  }
  return res
    .status(400)
    .json({ message: "user email or hotel were not provided" });
});
app.get("/booking", async (req, res) => {
  const { body } = req;
  if (body.userEmail && body.hotel) {
    const booking = BookingStorage.getBooking(body.userEmail, body.hotel);
    if (booking) {
      await sendMessage("bookings_statistics", {
        value: "bookingSearch",
      });
      await sendMessage("bookings_logs", {
        value: `booking for hotel ${body.hotel} by user ${body.userEmail} found`,
      });
      return res.status(200).json(booking);
    }
    return res.status(404).json({ message: "booking was not found" });
  }
  return res.status(400).json({ message: "email or hotel were not provided" });
});
app.get("/bookingsByEmail", async (req, res) => {
  const { body } = req;
  if (body.userEmail) {
    const bookings = BookingStorage.getBookingsByEmail(body.userEmail);
    if (bookings) {
      await sendMessage("bookings_statistics", {
        value: "bookingsByEmailSearch",
      });
      await sendMessage("bookings_logs", {
        value: `bookings by user ${body.userEmail} found`,
      });
      return res.status(200).json(bookings);
    }
    return res.status(404).json({ message: "bookings were not found" });
  }
  return res.status(400).json({ message: "email was not provided" });
});
app.get("/bookingsByHotel", async (req, res) => {
  const { body } = req;
  if (body.hotel) {
    const bookings = BookingStorage.getBookingsByHotel(body.hotel);
    if (bookings) {
      await sendMessage("bookings_statistics", {
        value: "bookingsByHotelSearch",
      });
      await sendMessage("bookings_logs", {
        value: `bookings for hotel ${body.hotel} found`,
      });
      return res.status(200).json(bookings);
    }
    return res.status(404).json({ message: "bookings were not found" });
  }
  return res.status(400).json({ message: "hotel was not provided" });
});
app.get("/bookings", async (req, res) => {
  await sendMessage("bookings_statistics", {
    value: "bookingsSearch",
  });
  await sendMessage("bookings_logs", {
    value: `bookings found`,
  });
  res.status(200).json({ bookings: BookingStorage.bookings });
});

app.get("/statistics", async (req, res) => {
  return res.status(200).json({ statistics: StatisticsService.statistics });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
