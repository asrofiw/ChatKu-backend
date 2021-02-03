<h1 align="center">ChatKu Backend</h1>



This is a ChatKu Backend application. Use for ChatKu Mobile App. Built with NodeJs using the ExpressJs Framework.
Express.js is a web application framework for Node.js. [More about Express](https://en.wikipedia.org/wiki/Express.js)

## Built With
[![Express.js](https://img.shields.io/badge/Express.js-4.x-orange.svg?style=rounded-square)](https://expressjs.com/en/starter/installing.html)
[![Node.js](https://img.shields.io/badge/Node.js-v.12.18.3-green.svg?style=rounded-square)](https://nodejs.org/)

## Requirements
1. <a href="https://nodejs.org/en/download/">Node Js</a>
2. Node_modules
3. <a href="https://www.getpostman.com/">Postman</a>
4. Web Server (ex. localhost)

## How to run the app ?
1. Open app's directory in CMD or Terminal
2. Type `npm install`
3. Turn on Web Server and MySQL can using Third-party tool like xampp, etc.
4. Create a database with the name ecommerce, and create table items
5. Open Postman desktop application or Chrome web app extension that has installed before
6. Choose HTTP Method and enter request url.(ex. localhost:8080/)
7. You can see all the end point [here](#end-point)

## End Point
**1. GET**

* `/private/friends`(Get all user's friends)

* `/private/friends/:idFriend` (Get user's friend from specific id)

* `/private/message` (Get list of chats from other users)

* `/private/message/:recepientId` (Get detail chats from users with specific id)

* `/private/users` (Get detail user login)

* `/users` (Get all users)

* `/users/:id` (Get detail user)

**2. POST**

* `/auth/login` (Create account (if account doesnt exist) and login to get token for user)

* `/private/friends` (Add friend from another user)

* `/private/message/:recepientId` (Send message to user with specific id)

**3. PATCH**

* `/private/friends/:idFriend` (Update friend's name)

* `/private/message/:recepientId` (Update read message with specific id)

* `/private/users` (Update user's profile)

**4. DELETE**

* `/private/friends/:idFriend` (Delete friend id)

* `/private/message/:messageId` (Delete message by id)

* `/private/users` (Delete account)
  