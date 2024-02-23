import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDYZKdblLeP1DYXv3JdhKWVuU91jmWXtQM",
  authDomain: "chat-app-74289.firebaseapp.com",
  projectId: "chat-app-74289",
  storageBucket: "chat-app-74289.appspot.com",
  messagingSenderId: "66799785731",
  appId: "1:66799785731:web:a7c88f71cb4d39fc11fb36"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const dbt = getDatabase(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getDatabase } from "firebase/database";
// import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: "AIzaSyByd2jWrm5UC_OMNUvVglYhnscBvDX1-q8",
//   authDomain: "nobu-aabd1.firebaseapp.com",
//   databaseURL: "https://nobu-aabd1-default-rtdb.firebaseio.com",
//   projectId: "nobu-aabd1",
//   storageBucket: "nobu-aabd1.appspot.com",
//   messagingSenderId: "764250910416",
//   appId: "1:764250910416:web:3c1b57161166ef1995b8d5"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const dbt = getDatabase(app);
// export const db = getFirestore(app);
// export const storage = getStorage(app);

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
// import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBFEIMycmRpoliAtAj_PIEkfiAOxCHHfeQ",
//   authDomain: "chatapp-53682.firebaseapp.com",
//   projectId: "chatapp-53682",
//   storageBucket: "chatapp-53682.appspot.com",
//   messagingSenderId: "725626483555",
//   appId: "1:725626483555:web:931c44b1069ee8a6201956"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const dbt = getDatabase(app);
// export const storage = getStorage(app);

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage";
// import { getFirestore } from "firebase/firestore";
// import { getDatabase } from "firebase/database";

// const firebaseConfig = {
//   apiKey: "AIzaSyBFz9NjKADruLk10SZJKikPFH3Y6iyQjhU",
//   authDomain: "dobu-347be.firebaseapp.com",
//   projectId: "dobu-347be",
//   storageBucket: "dobu-347be.appspot.com",
//   messagingSenderId: "1044743627844",
//   appId: "1:1044743627844:web:1cda7f7c7b6d2a4f330811"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const db = getFirestore(app);
// export const dbt = getDatabase(app);
// export const storage = getStorage(app);
