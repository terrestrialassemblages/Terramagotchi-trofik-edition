import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, set, onChildAdded, remove, get } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import { getAuth, signInAnonymously } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import FIREBASE_CONFIG from "./firebase_config.js";
import {addToCanvas} from "./sandSim.js";


// Function to connect to the database
export function connectToDB() {
    // Initialize firebase
    initializeApp(FIREBASE_CONFIG);
    const database = getDatabase();
    const auth = getAuth();
    
    // Authenticate user anonymously
    signInAnonymously(auth)
    .then((userCredential) => {
        // Anonymous user sign in
        const user = userCredential.user;
        console.log("Anonymous user ID:", user.uid);

        // Create table for current instance
        const instanceDB = ref(database, 'instances/' + INSTANCE_ID);
        const initialData = {
            startup : {
                element : null, 
                instanceID : INSTANCE_ID, 
                currtime : Date.now()
            }
        }
        set(instanceDB, initialData)
        .then(() => {
            console.log("CREATED DB: ", INSTANCE_ID);
        })

        // Create QR code for remote app
        createQR();

        // Remove older instances in the DB, if there are more than specified
        removeOldInstances(database, 10);

        // DB listener, runs when a new user action is detected
        onChildAdded(instanceDB, (snapshot) => {
            const newData = snapshot.val();
            if (newData.element != null) {
                console.log("New element added:", newData.element);
    
                // RUN CODE TO ADD ELEMENT TO GRID HERE
                addToCanvas(newData.element);

                // THEN REMOVE THE ENTRY FROM THE DB (MAYBE WE DONT NEED?)
                //console.log("REMOVING ENTRY key:", snapshot.key);

            }
        });
    })
    .catch((error) => {
        // Handle errors
        console.error("Error signing in anonymously:", error);
    });
}

// Function to remove instances from the database if the total number of instances exceeds the limit
function removeOldInstances(database, limit = 50) {
    const instancesRef = ref(database, 'instances');
    get(instancesRef)
    .then((snapshot) => {
        if (snapshot.exists()) {
            const instances = snapshot.val();
            const instanceKeys = Object.keys(instances);
            if (instanceKeys.length > limit) {
                // Sort instance keys by timestamp in ascending order
                instanceKeys.sort((a, b) => instances[a].startup.currtime - instances[b].startup.currtime);

                // Determine the number of instances to remove
                const instancesToRemove = instanceKeys.length - limit;

                // Remove the oldest instances
                for (let i = 0; i < instancesToRemove; i++) {
                    const oldestInstanceKey = instanceKeys[i];
                    const oldestInstanceDB = ref(database, 'instances/' + oldestInstanceKey);
                    remove(oldestInstanceDB)
                    .then(() => {
                        //console.log("Removed oldest instance:", oldestInstanceKey);
                    })
                    .catch((error) => {
                        console.error("Error removing instance:", oldestInstanceKey, error);
                    });
                }
            }
        }
    })
    .catch((error) => {
        console.error("Error removing instances, could not get snapshot of the table", error);
    });
}


