var scene = new THREE.Scene();

const loader = new THREE.GLTFLoader();

var keyboard = new THREEx.KeyboardState();
var clock = new THREE.Clock();

var basetree;

var isosp;

const momentNames = [
    "bricks",
    "apple",
    "canada",
    "summer",
    "milk",
    "benches",
    "plot",
    "trout",
    "hands",
    "tides",
    "syringe",
    "bricks",
]

const numbers = {
    "tides": "0038",
    "hands": "0037",
    "trout": "0036",
    "plot": "0035",
    "milk": "0032",
    "benches": "0033",
    "summer": "0034",
    "apple": "0031",
    "canada": "0030",
    "bricks": "0029",
    "syringe": "0026",
}

var colorPalette = [0x391463, 0x3A0842, 0xD1462F, 0x34F6F2, 0x2541B2]

const debugMat = new THREE.MeshBasicMaterial({
    color: 0xff0000
});

const defaultMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: true
});

const noHoverMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});

const hoveredMat = new THREE.MeshBasicMaterial({
    color: 0xEBCCFA,
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide
});

loader.load('iso_re.glb', function ( gltf ) {

    isosp = gltf.scene;
    isosp.position.y = 0;

    for(var i = isosp.children.length-1; i >= 0 ; i--) {
        
        var face = isosp.children[i];
        console.log(face);
        var pivot = new THREE.Group();
        isosp.remove(face);
        isosp.add( pivot );
        pivot.attach(face);
        // face.scale.set(3,3,3);
        
        const edgeMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0
        });
        face.children[0].material = defaultMat;
        const secondFace = face.children[0].clone();
        secondFace.material = noHoverMat;
        face.add(secondFace);

        face.remove(face.children[1]);
        // face.children[1].material = edgeMat;
    }
    isosp.scale.set(4,4,4);
    // isosp.position.set(2,0, 0);
    isosp.rotation.x = 0.5

    scene.add(isosp);
    
}, undefined, function ( error ) {
    console.error( error );
} );

var canvasarea = document.getElementById("canvas-container");

var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
camera.position.z = 10;

// const geometry = 
const material = new THREE.MeshPhongMaterial({
    color: 0x607370,
    specular: 0x555555,
    shininess: 30
   });

var light = new THREE.DirectionalLight( 0xffffff, 2 );
light.position.set( 0, 1, 1 ).normalize();
scene.add(light);

scene.add(camera)


scene.background = new THREE.Color( 0xffffff );

camera.filmOffset = -1;

var renderer = new THREE.WebGLRenderer({
    antialias:true
});


function setSize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    var scale = window.devicePixelRatio;
    renderer.setSize(canvasarea.clientWidth * scale, canvasarea.clientHeight * scale);
}

canvasarea.appendChild(renderer.domElement);
setSize();

window.addEventListener('resize', setSize);

controls = new OrbitControls( camera, renderer.domElement);
controls.autoRotate = false;

var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2(-1,1)

var isBetweenDragAndClick = false;

window.addEventListener('mousemove', (event) => {
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    isBetweenDragAndClick = true;
});
window.addEventListener('mousedown', () => {
    isBetweenDragAndClick = false;
});
window.addEventListener('mouseup', () => {
    if(isBetweenDragAndClick) {
        isBetweenDragAndClick = false;
        return;
    }
    if(hoveredName) {
        window.open(hoveredName + ".html", '_blank');
    }
});

var hovered = null;
var hoveredName = null;

function unhover() {
    hovered.parent.children[1].material = noHoverMat;
    document.getElementById(hoveredName).blur();
    document.getElementById('td_label').style.display = "none";
    canvasarea.style.cursor = "default";
}

function hover(objToHover, focusLink = true) {
    if(hovered) {
        unhover();
    }
    
    hovered = objToHover;
    objToHover.parent.children[1].material = hoveredMat;

    const idx = objToHover.parent.parent.parent.children.indexOf(objToHover.parent.parent);
    const name = momentNames[idx];
    if(name) {
        hoveredName = name;
        hovered = objToHover;
        if(focusLink) {
            document.getElementById(hoveredName).focus();
            canvasarea.style.cursor = "pointer";
        }

        const label = document.getElementById('td_label');
        label.innerText = "moment " + numbers[name] + " ::: " + name;
        label.style.display = "block";

        console.log(hovered.position);
        console.log(hovered.parent.position);
    }
}

function animate() {
    requestAnimationFrame( animate );
    renderer.render(scene, camera);
    controls.update();
	handlePopping();

    if(hovered) {
        const label = document.getElementById('td_label');
        const screenPos = hovered.getWorldPosition(new THREE.Vector3()).clone().project(camera);

        const screenX = ((screenPos.x + 1) / 2) * window.innerWidth;
        const screenY = ((-screenPos.y + 1) / 2) * window.innerHeight;
        label.style.translate = screenX + "px " + screenY + "px";
    }

    if(mouse.x > -0.5) {
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObject(scene, true);
        if(intersects.length > 0) {
            const objToHover = intersects[0].object;
            if(hovered != objToHover) {
                hover(objToHover);
            }
        } else if(hovered) {
            unhover();
            hoveredName = null;
            hovered = null;
        }
    }
}

var popTimer = 1;

var popping = [];
var popstart = {};
var amountMoved = {};
var amountRotated = {};
var originalpos = {};
var popDistance = {};

var inArchive = false;

var levels = {
    0.3: true,
    0.45: true,
    0.6: true,
    0.75 : true
};

function handlePopping() {
	var delta = clock.getDelta(); // seconds.
    var time = clock.getElapsedTime();
	var moveDistance = 20 * delta; // 200 pixels per second
	
    if(inArchive) {
        popTimer -= 14;
        inArchive  = false;
    }
    if(isosp) {
        isosp.rotation.z += delta / 3;
    }

    popTimer -= delta;
    if(popTimer <= 0 && popping.length != isosp.children.length) {
        popTimer += 2;
        var index;
        do {
            index = Math.floor(Math.random()*isosp.children.length);
        } while(popping.includes(index));

        popping.push(index);
        popstart[index] = time;
        amountMoved[index] = 0;
        amountRotated[index] = 0;

        var dist;
        var keys = Object.keys(levels);
        var isFree = false;
        for(var key of keys) {
            if(levels[key]) {
                isFree = true;
            }
        }
        if(isFree) {
            do {
                dist = keys[Math.floor(Math.random()*keys.length)];
            } while(!levels[dist]);
        
            levels[dist] = false;
        } else {
            dist = 0.5;
        }
        popDistance[index] = dist;
        originalpos[index] = isosp.children[index].children[0].position.clone();

    }
    var toRemove = [];
    for(var i of popping) {
        if(delta < 1) {
            var elem = isosp.children[i];
            elem.children[0].material = debugMat;
            // elem.translateOnAxis(new THREE.Vector3(0,0,1), 0.001);
            if(amountMoved[i] < popDistance[i] && amountRotated[i] == 0) {
                var moveDistance = 1 * delta;
                elem.children[0].translateOnAxis(elem.children[0].position, moveDistance);
                amountMoved[i] += moveDistance;
            } else if(amountRotated[i] < 2*Math.PI) {
                elem.rotateOnWorldAxis(new THREE.Vector3(-elem.position.y, elem.position.z, -elem.position.x).normalize(), delta)
                amountRotated[i] += delta;
            } else if(amountMoved[i] > 0) {
                var moveDistance = 1 * delta;   
                elem.translateOnAxis(elem.position, -moveDistance);
                amountMoved[i] -= moveDistance;
            } else {
                elem.translateOnAxis(elem.position, -amountMoved[i]);
                elem.rotation.set(0,0,0);
                // elem.position = originalpos[i];
                toRemove.push(i);
            }
        }
    }
    for(var i of toRemove) {
        popping.splice(popping.indexOf(i), 1)
        amountRotated[i] = 0
        amountMoved[i] = 0
        levels[popDistance[i]] = true;
    }
}

for(var i = 0; i < momentNames.length - 1; i++) {
    const momentName = momentNames[i];
    document.getElementById(momentName).idx = i;
    document.getElementById(momentName).addEventListener('mouseover', (evt) => {
        const idx = evt.currentTarget.idx;
        console.log(idx)
        hover(isosp.children[idx].children[0].children[0], false);
    });
}


animate();