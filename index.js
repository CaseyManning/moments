var db;

function showArchives() {
    document.getElementById("box1").classList.add("hidden");
    document.getElementById("box2").classList.remove("hidden");
    inArchive = true;
}

function initFirestore() {

    firebase.initializeApp({
        apiKey: "AIzaSyCmt8vmu_jtPJM5meZ74dCPXcRMLBx5pw4",
        authDomain: "tracker-386d8.firebaseapp.com",
        projectId: "tracker-386d8"
      });
      
    db = firebase.firestore();
}

initFirestore();

function logVisit() {
    db.collection("moments").add({
        action: "menuload",
        time: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

logVisit()