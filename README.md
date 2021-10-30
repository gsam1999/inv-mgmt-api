# Inventory Management API (Express.js and MongoDB)


## Description

This project is build using Express.js(a node.js framework) for the API and MongoDB as a database. This project is intended as an API server for https://github.com/gsam1999/inv-mgmt. The app can be installed on both windows and Linux.

## Installation

Nodejs is required for this project. npm v7 is used to install the necessary dependencies. Use the following command to install the dependencies once inside the folder.

```bash
npm install

```
After the node modules are installed run 

```bash
npm start
```
This starts the server on http://localhost:3000 by default, if all the dependencies are installed properly.

Install MongoDB locally on machine using https://docs.mongodb.com/manual/installation 
or utilize a cloud based service MongoDB atlas which provides a free tier (https://www.knowi.com/blog/getting-started-with-mongodb-atlas-overview-and-tutorial/).

Once the database is set up and is running, update the config.js file to point to the proper database instance and the database name.

A default user with will be created once the server is started with db connected, with the credentials

username: admin , password: admin , the password can be updated later.

Note: if the client application uses https, the server must also be deployed on https (https://stackoverflow.com/questions/11744975/enabling-https-on-express-js).

Also update the TOKEN_KEY present in config.js file to a valid key  to avoid security issues.



