# task-manager-api
This project was made as a part of Node.js course and concentrated on developing api which manage users and their tasks.
API works with MongoDB database which was deployed on MongoDB Atlas cloud. Using API of this application user can sign up and then 
login in order to manage his tasks list. Every time when user get in(login) token is generated in order to authenticate current user.
Only after his authentication user can use the application API, however, his token is checked by middleware function everytime before user
gets some data. Generation of tokens is provided by using jsonwebtoken and SECRET_KEY and user can login in simultaniously from many 
devices(Netflix style). 
Password of user is encrypted using bcryptjs. Approval of user's sign up as well as cancelation of his membership provided by email 
confirmation using sendgrid/mail API. Along with CRUD operations user also can upload file and upload/delete/use his avatar image to 
his page in jpg|jpeg|png formats. Data(listing of tasks) of user's tasks is provided using paganation. 
In this project test of code was made by testing units using jest. To see how those API in action is possible using Postman and link from 
heroku -- sapir-task-manager.herokuapp.com -- where given API are deployed. UI will be provided later on to fullfill the application.
