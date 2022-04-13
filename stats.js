var db;

function initFirestore() {

    firebase.initializeApp({
        apiKey: "AIzaSyCmt8vmu_jtPJM5meZ74dCPXcRMLBx5pw4",
        authDomain: "tracker-386d8.firebaseapp.com",
        projectId: "tracker-386d8"
      });
      
    db = firebase.firestore();
}

var usageData = {}

function readUsageData() {
    db.collection("moments").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            var data = doc.data();
            if(!usageData[data.moment]) {
                usageData[data.moment] = 1;
            } else {
                usageData[data.moment] += 1;
            }
        });

        
        var label = document.getElementById("menulabel");
        label.innerHTML += usageData["menu"];

        for (const [key, value] of Object.entries(usageData)) {
            newelement = label.cloneNode(false);
            newelement.innerHTML = key + " loads: " + value;
            label.parentElement.appendChild(newelement);
        }

        label.remove();
          
    });
}
console.log(usageData)

initFirestore();
readUsageData();