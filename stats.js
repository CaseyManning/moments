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

var usageDataRecent = {};

var usagePerDay = {};

function readUsageData() {
    db.collection("moments").get().then((querySnapshot) => {

        var totalReads = 0;

        querySnapshot.forEach((doc) => {
            var data = doc.data();
            
            var current = new Date();
            if(!usageDataRecent[data.moment]) {
                usageDataRecent[data.moment] = 0;
            }
            if(current.getTime() / 1000 - data.time.seconds < 86400) {
                usageDataRecent[data.moment] += 1;
            }
            if(!usageData[data.moment]) {
                usageData[data.moment] = 1;
            } else {
                usageData[data.moment] += 1;
            }
            if(data.moment != "menu") {
                totalReads += 1;

                var day = Math.floor(data.time.seconds / 86400);
                if(!usagePerDay[day]) {
                    usagePerDay[day] = 1
                } else {
                    usagePerDay[day] += 1;
                }
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
        loadTimeChart();

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
                    display: false,
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

function loadTimeChart() {

    var labels = [];
    var data = [];

    // for (const [key, value] of Object.entries(usagePerDay)) {
    //     labels.push(key)
    //     data.push(value);
    // }

    var currentDay = Math.floor((new Date().getTime() / 1000) / 86400);

    for(var i = currentDay-30; i < currentDay; i++) {
        var day = new Date(i*86400*1000);
        labels.push(day.toISOString().substring(0, 10))
        if(usagePerDay[i]) {
            data.push(usagePerDay[i])
        } else {
            data.push(0);
        }
    }

    const ctx = document.getElementById('timeChart').getContext('2d');

    const myChart = new Chart(ctx, { 
        type: 'line',
        data: {
          labels: labels,
          datasets: [{ 
              data: data,
              label: "Views",
              borderColor: "#fff",
              backgroundColor: "#fff",
              fill: false,
              pointRadius: 1,
              pointHoverRadius: 8,
              lineTension: 0.2,
            }
          ]
        },
        options: {
          title: {
            display: false
          },
          scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: 'white',
                    font: {
                        size: 15,
                        family: 'Quicksand'
                    },
                    stepSize: 10
                },
                stacked: true,
                grid: {
                    color: 'rgba(255,255,255,0)',
                }
            },
            x: {
                ticks: {
                    color: 'rgba(0,0,0,0);',
                    display: false
                },
                stacked: true,
                grid: {
                    color: 'rgba(255,255,255,0)',
                }
            }
        },
        plugins: {  // 'legend' now within object 'plugins {}'
            legend: {
                display: false,
              labels: {
                  display: false,
                  font: {
                    size: 0 // 'size' now within object 'font {}'
                  }
              }
            }
          },
        },
      });     
}

async function fetchAsync (url) {
    var dat = "";
    let response = await fetch(url,
        {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *cors, same-origin
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Token 7866371b-1813-4c4e-a0e3-e043373aa270', // manual, *follow, error
              // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(dat) // body data type must match "Content-Type" header
    });
    let data = await response.json();
    return data;
  }
