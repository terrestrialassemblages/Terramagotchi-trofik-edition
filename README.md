# Terramagotchi trōfik edition
website deployed at: https://terramagotchi-trofik-edition.web.app

## Project Management Tool
ADD LINK HERE


## Project Description
Terramagotchi Trōfik edition is a minimally interactive 2D web application showcasing the intricacies of the elements beneath the soil. Our goal is to educate users by illustrating the interactions among the elements in the soil ecosystem as users can watch how the plants and their root systems develop over time. The application comes in two parts, the main application featuring the 2D canvas, and a remote application accessible through the QR code displayed on the main interface. The remote application provides ways for users to interact with the main application with options such as controlling the weather and changing time.

## Technologies

**Languages**
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

**Libraries**
- [TailwindCSS v3.3.3](https://tailwindcss.com/docs)

**Hosting and Backend**
- [Google Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)


## Installation and setup

Ensure that Node.js is installed on your desktop and clone the git repository.

Navigate to the directory and edit the `firebase_config.js` file to connect to your own Firebase Realtime Database if needed. More details on how to create a Firebase project and setup the Realtime Database [here](https://firebase.google.com/docs/web/setup)
```
// Change the following according to your Firebase project configuration
const FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_DOMAIN",
    databaseURL: "YOUR_APP_URL",
    projectId: "YOUR_PROJECT",
    storageBucket: "YOUR_APP.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

Once you have setup the firebase_config.js file you can install the required dependencies with
```
npm install
```
And host the app locally with
```
npm run dev
```
You will be able to access your application in the browser from `http://localhost:8080/`

### Deploying using Firebase Hosting
To deploy the web application using Firebase Hosting, first install Firebase Tools. 
```
npm install -g firebase-tools
```
Then login to your Google Firebase account. Make sure you have created a Firebase project beforehand. If you created your own Realtime Database, use the same email address and project associated with that database to log in.
```
firebase login
```
Then run the setup wizard for Firebase with
```
firebase init
```
Once you have completed all necessary steps then you can deploy the application with
```
firebase deploy
```


## Usage Examples


## Future Plans


## Acknowledgements

- [Firebase Youtube Channel](https://www.youtube.com/@Firebase)

