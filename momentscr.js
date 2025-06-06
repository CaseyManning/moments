var db;

if(document.cookie != "casey") {
    firebase.initializeApp({
        apiKey: "AIzaSyCmt8vmu_jtPJM5meZ74dCPXcRMLBx5pw4",
        authDomain: "tracker-386d8.firebaseapp.com",
        projectId: "tracker-386d8"
        });
        
    db = firebase.firestore();

    var source = "unknown";
    if(window.location.toString().includes("utm_medium=email")) {
        source = "email"
    }

    db.collection("moments").add({
        moment: document.title,
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

var html = `
  <div class="footer">
  </div>
`;

window.addEventListener('load', function() {
    document.body.appendChild(document.createElement('div')).innerHTML = html;
});