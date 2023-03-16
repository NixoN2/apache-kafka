# apache-kafka

## Начало работы

### docker-compose up

### npm install

### npm run start

### Отправить запросы, например, через Postman

### Смотреть в консоль, где работает LoggerService. Отправить get запрос на /statistics, где можно будет увидеть статистику по запросам.

## User Service

#### post /user (email: string, password:string)
#### get /users 
#### get /user (email:string)

## Statistics Service

#### get /statistics

## Bookings Service

#### post /booking (userEmail: string, hotel: string)
#### get /booking (userEmail: string, hotel: string)
#### get /bookings
#### get /bookingsByHotel (hotel: string)
#### get /bookingsByEmail (userEmail: string)
