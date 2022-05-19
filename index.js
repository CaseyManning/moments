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
    var source = "unknown";
    if(window.location.toString().includes("utm_medium=email")) {
        source = "email"
    }
    db.collection("moments").add({
        moment: "menu",
        time: firebase.firestore.FieldValue.serverTimestamp(),
        source: source
    })
    .then((docRef) => {
        console.log("Document written with ID: ", docRef.id);
    })
    .catch((error) => {
        console.error("Error adding document: ", error);
    });
}

logVisit()