# Terramagotchi trōfik edition
website deployed at: https://terramagotchi-trofik-edition.web.app

## Project Management Tool
https://app.ganttpro.com/#/project/1691728466403/gantt

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
### To set up as the host to go fullscreen (For Windows using Google Chrome)
Go to where Chrome is located (it should be in C:\Program Files\Google\Chrome\Application. If not, just search in taskbar for Chrome and then open file location)
Right click on chrome.exe and create shortcut, it will then ask if it can create it in desktop because it can't create it in the folder, click yes
Right click on the new shortcut in desktop and right click and go to properties
At the end of whatever that is in the <b>target</b> box, add this:<b>--new-window  --start-fullscreen https://terramagotchi-trofik-edition.web.app/</b>
The shortcut will be on your desktop and rename it as needed. To automatically open the application in fullscreen, use the shortcut.
<b>Please restart your device if it is not working, Google Chrome often doesn't go fullscreen if there is an update for it so please restart to ensure it works.</b>

Alternatively, go to the application https://terramagotchi-trofik-edition.web.app/, click on the three vertical dots under the "X" close button. 
Go down to <b>Save and Share</b> and <b>Create shortcut...</b>.
The shortcut will be on your desktop and although it is not fully frameless, it is an alternative if --start-fullscreen doesn't work.



## Usage Examples
The project is an application created for display in museums.

## Future Plans
1. Incoporate the rest of the soil food web such as nematodes and higher level predators. This will show the dynamic relationship between how nature balances out the population of the elements in the soil and how they interact with each other. 

2. Temperature Variability: Introduce temperature as a vital environmental factor. The temperature will vary over time, affecting plant growth and interactions within the ecosystem. 

3. Diverse Flora: Introduce a wider range of plant species, including colorful flowers and trees. Users can choose from an array of flora to cultivate and learn about, each with specific temperature preferences.

4. Dynamic Lighting: Implement a more realistic representation of sunlight changes. A visible beam of light will gradually move from right to left, simulating the sun's path across the sky and influencing the temperature of the environment.

5. Cloud Formation: Enhance the environmental elements by modeling cloud formation. As water evaporates from the soil, it will transform into cloud particles, gradually accumulating into moving cloud layers that traverse the screen from right to left, affecting temperature and weather patterns.

6. Educational Resources: Incorporate educational resources like articles, videos, and quizzes to provide users with in-depth knowledge about soil ecosystems, plant biology, and the role of temperature in plant development.

## Acknowledgements
- [The information on miro board](https://miro.com/app/board/uXjVOigGsjY=/).
- [Firebase Youtube Channel](https://www.youtube.com/@Firebase)

