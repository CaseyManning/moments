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

var usageDataRecent = {}

function readUsageData() {
    db.collection("moments").get().then((querySnapshot) => {

        var totalReads = 0;

        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
            var data = doc.data();
            
            var current = new Date();
            console.log(current.getTime() / 1000)
            console.log( data.time.seconds);
            if(!usageDataRecent[data.moment]) {
                usageDataRecent[data.moment] = 0;
            }
            if(current.getTime() / 1000 - data.time.seconds < 8000) {
                usageDataRecent[data.moment] += 1;
            }
            if(!usageData[data.moment]) {
                usageData[data.moment] = 1;
            } else {
                usageData[data.moment] += 1;
            }
            if(data.moment != "menu") {
                totalReads += 1;
            }
        });

        
        var label = document.getElementById("menulabel");
        label.innerHTML = usageData["menu"];

        var label = document.getElementById("readslabel");
        label.innerHTML = totalReads;

        // for (const [key, value] of Object.entries(usageData)) {
        //     newelement = label.cloneNode(false);
        //     newelement.innerHTML = key + " loads: " + value;
        //     label.parentElement.appendChild(newelement);
        // }

        // label.remove();
        loadChart();
    });
}
console.log(usageData)

initFirestore();
readUsageData();

function loadChart() {
    const ctx = document.getElementById('myChart').getContext('2d');

    var dx = [];
    var dy = [];
    for (const [key, value] of Object.entries(usageData).sort(([k1, v1], [k2, v2]) => v2 - v1)) {
        if(key != "menu") {
            dx.push(key)
            dy.push(value - usageDataRecent[key]);
        }
    }

    var dy2 = [];
    for (const [key, value] of Object.entries(usageData).sort(([k1, v1], [k2, v2]) => v2 - v1)) {
        if(key != "menu") {
            if(usageDataRecent[key]) {
                dy2.push(usageDataRecent[key]);
            } else {
                dy2.push(0);
            }
        }
    }

    const myChart = new Chart(ctx, {            //TODO: make recent reads a color on the bar chart
        type: 'bar',
        data: {
            labels: dx,
            datasets: [{
                label: 'Views',
                data: dy,
                backgroundColor: [
                    'rgba(255, 255, 255, 1)'
                ],
                borderWidth: 0,
            },
            {
                label: 'Recents',
                data: dy2,
                backgroundColor: [
                    'rgba(171, 240, 127, 1)'
                ],
                borderWidth: 0,
            }]
        },
        options: {
            indexAxis: 'y',
            maxBarThickness: '15',
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        font: {
                            size: 15,
                            family: 'Quicksand'
                        }
                    },
                    stacked: true
                },
                x: {
                    ticks: {
                        color: 'rgba(0,0,0,0);',
                        display: false
                    },
                    stacked: true,
                }
            },
            plugins: {  // 'legend' now within object 'plugins {}'
                legend: {
                  labels: {
                      display: false,
                    color: "blue",  // not 'fontColor:' anymore
                    // fontSize: 18  // not 'fontSize:' anymore
                    font: {
                      size: 0 // 'size' now within object 'font {}'
                    }
                  }
                }
              },
        }
    });
}
