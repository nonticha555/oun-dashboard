/* =========================================================
   AGROFORESTRY 1 RAI
   Main Application
========================================================= */


/* =========================================================
   1. PLANT DATABASE
========================================================= */

let plants = [

    {
        id: "coconut",

        name: "มะพร้าว",

        icon: "🌴",

        layer: 1,

        heightMin: 10,

        heightMax: 20,

        quantity: 20,

        spacing: 8,

        yieldPerTree: 80,

        price: 15,

        harvestStart: 3
    },


    {
        id: "banana",

        name: "กล้วยหอมทอง",

        icon: "🍌",

        layer: 2,

        heightMin: 2.5,

        heightMax: 3.5,

        quantity: 30,

        spacing: 3,

        yieldPerTree: 12,

        price: 20,

        harvestStart: 5
    },


    {
        id: "fingerroot",

        name: "กระชาย",

        icon: "🌱",

        layer: 4,

        heightMin: 0.3,

        heightMax: 0.5,

        quantity: 500,

        spacing: 0.5,

        yieldPerTree: 0.2,

        price: 80,

        harvestStart: 8
    },


    {
        id: "turmeric",

        name: "ขมิ้น",

        icon: "🌱",

        layer: 4,

        heightMin: 0.3,

        heightMax: 0.9,

        quantity: 400,

        spacing: 0.5,

        yieldPerTree: 0.25,

        price: 60,

        harvestStart: 9
    },


    {
        id: "mango",

        name: "มะม่วง",

        icon: "🥭",

        layer: 2,

        heightMin: 4,

        heightMax: 8,

        quantity: 15,

        spacing: 6,

        yieldPerTree: 80,

        price: 35,

        harvestStart: 4
    }

];


/* =========================================================
   2. GLOBAL VARIABLES
========================================================= */

let scene;

let camera;

let renderer;

let controls;

let raycaster;

let mouse;

let farmObjects = [];

let incomeChart;


/* =========================================================
   3. INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        initializeThree();

        renderPlantList();

        renderPlantTable();

        updateDashboard();

        updateHarvest();

        createIncomeChart();

        setupPlantForm();

    }
);


/* =========================================================
   4. THREE.JS
========================================================= */

function initializeThree() {

    const container =
        document.getElementById(
            "threeContainer"
        );


    /* ---------------------------------------------
       SCENE
    --------------------------------------------- */

    scene =
        new THREE.Scene();


    scene.background =
        new THREE.Color(
            0xddebdc
        );


    /* ---------------------------------------------
       CAMERA
    --------------------------------------------- */

    camera =
        new THREE.PerspectiveCamera(

            45,

            container.clientWidth /
            container.clientHeight,

            0.1,

            1000

        );


    camera.position.set(
        45,
        35,
        45
    );


    /* ---------------------------------------------
       RENDERER
    --------------------------------------------- */

    renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            alpha: false

        });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );


    renderer.setSize(

        container.clientWidth,

        container.clientHeight

    );


    renderer.shadowMap.enabled = true;


    container.innerHTML = "";


    container.appendChild(
        renderer.domElement
    );


    /* ---------------------------------------------
       LIGHT
    --------------------------------------------- */

    const ambient =
        new THREE.AmbientLight(
            0xffffff,
            2
        );


    scene.add(ambient);


    const sunlight =
        new THREE.DirectionalLight(
            0xffffff,
            2.5
        );


    sunlight.position.set(
        30,
        60,
        20
    );


    sunlight.castShadow = true;


    scene.add(sunlight);


    /* ---------------------------------------------
       CONTROLS
    --------------------------------------------- */

    controls =
        new THREE.OrbitControls(
            camera,
            renderer.domElement
        );


    controls.enableDamping = true;

    controls.dampingFactor = 0.06;

    controls.target.set(
        0,
        0,
        0
    );


    /* ---------------------------------------------
       RAYCASTER
    --------------------------------------------- */

    raycaster =
        new THREE.Raycaster();


    mouse =
        new THREE.Vector2();


    renderer.domElement.addEventListener(
        "mousemove",
        onMouseMove
    );


    renderer.domElement.addEventListener(
        "click",
        onMouseClick
    );


    /* ---------------------------------------------
       FARM
    --------------------------------------------- */

    createFarmGround();

    createFarmBoundary();

    createGrid();

    createPlants();


    /* ---------------------------------------------
       RESIZE
    --------------------------------------------- */

    window.addEventListener(
        "resize",
        resizeThree
    );


    animate();

}


/* =========================================================
   5. FARM GROUND
========================================================= */

function createFarmGround() {

    const geometry =
        new THREE.BoxGeometry(
            40,
            0.5,
            40
        );


    const material =
        new THREE.MeshStandardMaterial({

            color: 0x8eaa78

        });


    const ground =
        new THREE.Mesh(
            geometry,
            material
        );


    ground.position.y =
        -0.25;


    ground.receiveShadow = true;


    scene.add(ground);

}


/* =========================================================
   6. FARM BOUNDARY
========================================================= */

function createFarmBoundary() {

    const points = [

        new THREE.Vector3(
            -20,
            0.1,
            -20
        ),

        new THREE.Vector3(
            20,
            0.1,
            -20
        ),

        new THREE.Vector3(
            20,
            0.1,
            20
        ),

        new THREE.Vector3(
            -20,
            0.1,
            20
        ),

        new THREE.Vector3(
            -20,
            0.1,
            -20
        )

    ];


    const geometry =
        new THREE.BufferGeometry()
            .setFromPoints(points);


    const material =
        new THREE.LineBasicMaterial({

            color: 0x315a37

        });


    const boundary =
        new THREE.Line(
            geometry,
            material
        );


    scene.add(boundary);

}


/* =========================================================
   7. GRID
========================================================= */

function createGrid() {

    const grid =
        new THREE.GridHelper(
            40,
            40,
            0x58745a,
            0xaebcaf
        );


    grid.position.y =
        0.02;


    scene.add(grid);

}


/* =========================================================
   8. CREATE PLANTS
========================================================= */

function createPlants() {

    clearPlants();


    plants.forEach(
        plant => {

            const positions =
                calculatePositions(
                    plant
                );


            positions.forEach(
                position => {

                    createPlant3D(
                        plant,
                        position.x,
                        position.z
                    );

                }
            );

        }
    );

}


/* =========================================================
   9. CALCULATE PLANT POSITIONS
========================================================= */

function calculatePositions(
    plant
) {

    const result = [];


    /*
       จำนวนต้นที่ต้องสร้างจริงใน 3D

       เพื่อไม่ให้ browser หนักเกินไป
       เราจะจำกัด visual plants
    */

    const visualCount =
        Math.min(
            plant.quantity,
            80
        );


    const columns =
        Math.ceil(
            Math.sqrt(
                visualCount
            )
        );


    const spacing =
        Math.max(
            plant.spacing,
            1
        );


    const start =
        -((columns - 1) *
        spacing) / 2;


    for (
        let i = 0;
        i < visualCount;
        i++
    ) {

        const row =
            Math.floor(
                i / columns
            );


        const col =
            i % columns;


        let x =
            start +
            col *
            spacing;


        let z =
            start +
            row *
            spacing;


        /*
           offset เล็กน้อยตาม layer
           เพื่อไม่ให้ต้นไม้ทุกชั้น
           ซ้อนตำแหน่งกันหมด
        */

        if (plant.layer === 2) {

            x += 1.0;

            z += 1.0;

        }


        if (plant.layer === 3) {

            x += 0.5;

            z -= 0.5;

        }


        if (plant.layer === 4) {

            x -= 0.5;

            z += 0.5;

        }


        /*
           จำกัดพื้นที่ 40 x 40 m
        */

        if (
            Math.abs(x) < 19 &&
            Math.abs(z) < 19
        ) {

            result.push({
                x,
                z
            });

        }

    }


    return result;

}


/* =========================================================
   10. CREATE 3D PLANT
========================================================= */

function createPlant3D(
    plant,
    x,
    z
) {

    const group =
        new THREE.Group();


    group.userData = {

        plantId:
            plant.id,

        plantName:
            plant.name,

        layer:
            plant.layer

    };


    /* ---------------------------------------------
       HEIGHT
    --------------------------------------------- */

    const height =
        (
            plant.heightMin +
            plant.heightMax
        ) / 2;


    const normalizedHeight =
        Math.max(
            0.4,
            height
        );


    /* ---------------------------------------------
       STEM
    --------------------------------------------- */

    const trunkGeometry =
        new THREE.CylinderGeometry(

            Math.max(
                0.08,
                normalizedHeight * 0.035
            ),

            Math.max(
                0.12,
                normalizedHeight * 0.05
            ),

            normalizedHeight,

            8

        );


    const trunkMaterial =
        new THREE.MeshStandardMaterial({

            color: 0x765d3d

        });


    const trunk =
        new THREE.Mesh(
            trunkGeometry,
            trunkMaterial
        );


    trunk.position.y =
        normalizedHeight / 2;


    trunk.castShadow = true;


    group.add(trunk);


    /* ---------------------------------------------
       CANOPY
    --------------------------------------------- */

    const canopySize =
        Math.max(
            0.5,
            normalizedHeight * 0.25
        );


    let canopyColor;


    switch (plant.layer) {

        case 1:

            canopyColor =
                0x1e6630;

            break;

        case 2:

            canopyColor =
                0x4d8d3d;

            break;

        case 3:

            canopyColor =
                0x88a94b;

            break;

        case 4:

            canopyColor =
                0xbab84c;

            break;

    }


    const canopyGeometry =
        new THREE.SphereGeometry(

            canopySize,

            12,

            8

        );


    const canopyMaterial =
        new THREE.MeshStandardMaterial({

            color:
                canopyColor,

            roughness:
                0.9

        });


    const canopy =
        new THREE.Mesh(
            canopyGeometry,
            canopyMaterial
        );


    canopy.position.y =
        normalizedHeight;


    canopy.scale.y =
        0.75;


    canopy.castShadow = true;


    group.add(canopy);


    /* ---------------------------------------------
       POSITION
    --------------------------------------------- */

    group.position.set(
        x,
        0,
        z
    );


    scene.add(group);


    farmObjects.push(
        group
    );

}


/* =========================================================
   11. CLEAR PLANTS
========================================================= */

function clearPlants() {

    farmObjects.forEach(
        object => {

            scene.remove(
                object
            );

        }
    );


    farmObjects = [];

}


/* =========================================================
   12. ANIMATION
========================================================= */

function animate() {

    requestAnimationFrame(
        animate
    );


    controls.update();


    renderer.render(
        scene,
        camera
    );

}


/* =========================================================
   13. RESIZE
========================================================= */

function resizeThree() {

    const container =
        document.getElementById(
            "threeContainer"
        );


    camera.aspect =
        container.clientWidth /
        container.clientHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(

        container.clientWidth,

        container.clientHeight

    );

}


/* =========================================================
   14. CAMERA VIEWS
========================================================= */

function topView() {

    camera.position.set(
        0,
        65,
        0
    );


    controls.target.set(
        0,
        0,
        0
    );

}


function frontView() {

    camera.position.set(
        0,
        20,
        60
    );


    controls.target.set(
        0,
        4,
        0
    );

}


function perspectiveView() {

    camera.position.set(
        45,
        35,
        45
    );


    controls.target.set(
        0,
        4,
        0
    );

}


/* =========================================================
   15. MOUSE INTERACTION
========================================================= */

function onMouseMove(
    event
) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    mouse.x =
        (
            (
                event.clientX -
                rect.left
            ) /
            rect.width
        ) *
        2 - 1;


    mouse.y =
        -(
            (
                event.clientY -
                rect.top
            ) /
            rect.height
        ) *
        2 + 1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersects =
        raycaster.intersectObjects(
            farmObjects,
            true
        );


    const tooltip =
        document.getElementById(
            "plantTooltip"
        );


    if (
        intersects.length > 0
    ) {

        let object =
            intersects[0].object;


        while (
            object.parent &&
            !object.userData.plantName
        ) {

            object =
                object.parent;

        }


        if (
            object.userData.plantName
        ) {

            tooltip.innerHTML = `

                <strong>
                    ${object.userData.plantName}
                </strong>

                <br>

                Layer ${object.userData.layer}

            `;


            tooltip.style.display =
                "block";


            tooltip.style.left =
                event.clientX + 15 + "px";


            tooltip.style.top =
                event.clientY + 15 + "px";


            return;

        }

    }


    tooltip.style.display =
        "none";

}


/* =========================================================
   16. CLICK PLANT
========================================================= */

function onMouseClick(
    event
) {

    const rect =
        renderer.domElement
            .getBoundingClientRect();


    mouse.x =
        (
            (
                event.clientX -
                rect.left
            ) /
            rect.width
        ) *
        2 - 1;


    mouse.y =
        -(
            (
                event.clientY -
                rect.top
            ) /
            rect.height
        ) *
        2 + 1;


    raycaster.setFromCamera(
        mouse,
        camera
    );


    const intersects =
        raycaster.intersectObjects(
            farmObjects,
            true
        );


    if (
        intersects.length === 0
    ) {

        return;

    }


    let object =
        intersects[0].object;


    while (
        object.parent &&
        !object.userData.plantName
    ) {

        object =
            object.parent;

    }


    if (
        object.userData.plantName
    ) {

        const plant =
            plants.find(
                p =>
                    p.name ===
                    object.userData.plantName
            );


        if (plant) {

            alert(

                `${plant.icon} ${plant.name}\n\n` +

                `Canopy Layer: ${plant.layer}\n` +

                `ความสูง: ${plant.heightMin}–${plant.heightMax} m\n` +

                `จำนวน: ${plant.quantity} ต้น\n` +

                `ผลผลิต: ${plant.yieldPerTree} / ต้น / ปี\n` +

                `ราคา: ฿${plant.price} / หน่วย`

            );

        }

    }

}


/* =========================================================
   17. RENDER PLANT LIST
========================================================= */

function renderPlantList() {

    const container =
        document.getElementById(
            "plantList"
        );


    container.innerHTML = "";


    plants.forEach(
        plant => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "plant-row";


            row.innerHTML = `

                <div class="plant-dot">

                    ${plant.icon}

                </div>


                <div class="plant-info">

                    <strong>
                        ${plant.name}
                    </strong>

                    <small>
                        Layer ${plant.layer}
                    </small>

                </div>


                <div class="plant-count">

                    ${plant.quantity}

                </div>

            `;


            container.appendChild(
                row
            );

        }
    );

}


/* =========================================================
   18. UPDATE DASHBOARD
========================================================= */

function updateDashboard() {

    let totalPlants = 0;

    let totalIncome = 0;


    const layerCounts = {

        1: 0,

        2: 0,

        3: 0,

        4: 0

    };


    plants.forEach(
        plant => {

            totalPlants +=
                plant.quantity;


            const income =
                plant.quantity *
                plant.yieldPerTree *
                plant.price;


            totalIncome +=
                income;


            layerCounts[
                plant.layer
            ] +=
                plant.quantity;

        }
    );


    document.getElementById(
        "totalPlants"
    ).textContent =
        formatNumber(
            totalPlants
        );


    document.getElementById(
        "totalIncome"
    ).textContent =
        formatMoney(
            totalIncome
        );


    document.getElementById(
        "layer1Count"
    ).textContent =
        formatNumber(
            layerCounts[1]
        ) + " ต้น";


    document.getElementById(
        "layer2Count"
    ).textContent =
        formatNumber(
            layerCounts[2]
        ) + " ต้น";


    document.getElementById(
        "layer3Count"
    ).textContent =
        formatNumber(
            layerCounts[3]
        ) + " ต้น";


    document.getElementById(
        "layer4Count"
    ).textContent =
        formatNumber(
            layerCounts[4]
        ) + " ต้น";

}


/* =========================================================
   19. FORMAT NUMBER
========================================================= */

function formatNumber(
    number
) {

    return Number(
        number
    ).toLocaleString(
        "th-TH"
    );

}


/* =========================================================
   20. FORMAT MONEY
========================================================= */

function formatMoney(
    number
) {

    return "฿" +
        Number(
            number
        ).toLocaleString(
            "th-TH",
            {
                maximumFractionDigits: 0
            }
        );

}


/* =========================================================
   21. TABLE
========================================================= */

function renderPlantTable() {

    const tbody =
        document.getElementById(
            "plantTable"
        );


    tbody.innerHTML = "";


    plants.forEach(
        plant => {

            const annualIncome =
                plant.quantity *
                plant.yieldPerTree *
                plant.price;


            const tr =
                document.createElement(
                    "tr"
                );


            tr.innerHTML = `

                <td>
                    ${plant.icon}
                    ${plant.name}
                </td>


                <td>
                    Layer ${plant.layer}
                </td>


                <td>
                    ${plant.heightMin}
                    –
                    ${plant.heightMax}
                    m
                </td>


                <td>
                    ${formatNumber(
                        plant.quantity
                    )}
                </td>


                <td>
                    ${plant.yieldPerTree}
                </td>


                <td>
                    ฿${formatNumber(
                        plant.price
                    )}
                </td>


                <td>
                    <strong>
                        ${formatMoney(
                            annualIncome
                        )}
                    </strong>
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   22. CANOPY FILTER
========================================================= */

function updateLayers() {

    const checkboxes =
        document.querySelectorAll(
            ".layer input"
        );


    const visibleLayers = [];


    checkboxes.forEach(
        checkbox => {

            if (
                checkbox.checked
            ) {

                visibleLayers.push(
                    Number(
                        checkbox.dataset.layer
                    )
                );

            }

        }
    );


    farmObjects.forEach(
        object => {

            const layer =
                object.userData.layer;


            object.visible =
                visibleLayers.includes(
                    layer
                );

        }
    );

}


/* =========================================================
   23. SHOW ALL LAYERS
========================================================= */

function toggleAllLayers() {

    document
        .querySelectorAll(
            ".layer input"
        )
        .forEach(
            checkbox => {

                checkbox.checked =
                    true;

            }
        );


    updateLayers();

}


/* =========================================================
   24. HARVEST CALENDAR
========================================================= */

function updateHarvest() {

    const month =
        Number(
            document.getElementById(
                "monthSelect"
            ).value
        );


    const container =
        document.getElementById(
            "harvestList"
        );


    container.innerHTML = "";


    plants.forEach(
        plant => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "harvest-item";


            if (
                plant.harvestStart ===
                month
            ) {

                item.classList.add(
                    "active"
                );

            }


            item.innerHTML = `

                <span>
                    ${plant.icon}
                    ${plant.name}
                </span>

                <span>

                    ${
                        plant.harvestStart === month
                            ? "เก็บเกี่ยว"
                            : "—"

                    }

                </span>

            `;


            container.appendChild(
                item
            );

        }
    );

}


/* =========================================================
   25. INCOME CALCULATION
========================================================= */

function calculateAnnualIncome() {

    return plants.reduce(

        (
            total,
            plant
        ) => {

            return total +

                (
                    plant.quantity *
                    plant.yieldPerTree *
                    plant.price
                );

        },

        0

    );

}


/* =========================================================
   26. 10 YEAR INCOME
========================================================= */

function calculate10YearIncome() {

    const years = [];


    for (
        let year = 1;
        year <= 10;
        year++
    ) {

        let income = 0;


        plants.forEach(
            plant => {

                /*
                   สมมติว่าไม้ยืนต้น
                   ผลผลิตเพิ่มขึ้นตามอายุ
                */

                let growthFactor =
                    1;


                if (
                    year === 1
                ) {

                    growthFactor =
                        0.3;

                }


                else if (
                    year === 2
                ) {

                    growthFactor =
                        0.6;

                }


                else if (
                    year === 3
                ) {

                    growthFactor =
                        0.8;

                }


                else if (
                    year >= 4
                ) {

                    growthFactor =
                        1;

                }


                income +=

                    plant.quantity *
                    plant.yieldPerTree *
                    plant.price *
                    growthFactor;

            }
        );


        years.push(
            Math.round(
                income
            )
        );

    }


    return years;

}


/* =========================================================
   27. CREATE INCOME CHART
========================================================= */

function createIncomeChart() {

    const canvas =
        document.getElementById(
            "incomeChart"
        );


    const data =
        calculate10YearIncome();


    const total =
        data.reduce(
            (
                a,
                b
            ) =>
                a + b,
            0
        );


    document.getElementById(
        "income10Year"
    ).textContent =
        formatMoney(
            total
        );


    incomeChart =
        new Chart(
            canvas,
            {

                type:
                    "bar",


                data: {

                    labels: [

                        "ปี 1",

                        "ปี 2",

                        "ปี 3",

                        "ปี 4",

                        "ปี 5",

                        "ปี 6",

                        "ปี 7",

                        "ปี 8",

                        "ปี 9",

                        "ปี 10"

                    ],


                    datasets: [

                        {

                            label:
                                "รายได้",

                            data:
                                data,

                            borderWidth:
                                1

                        }

                    ]

                },


                options: {

                    responsive:
                        true,


                    plugins: {

                        legend: {

                            display:
                                false

                        }

                    },


                    scales: {

                        y: {

                            beginAtZero:
                                true,


                            ticks: {

                                callback:
                                    value =>
                                        "฿" +
                                        Number(
                                            value
                                        ).toLocaleString(
                                            "th-TH"
                                        )

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   28. REFRESH CHART
========================================================= */

function updateIncomeChart() {

    if (
        incomeChart
    ) {

        incomeChart.destroy();

    }


    createIncomeChart();

}


/* =========================================================
   29. MODAL
========================================================= */

function openPlantModal() {

    document
        .getElementById(
            "plantModal"
        )
        .classList.add(
            "show"
        );

}


function closePlantModal() {

    document
        .getElementById(
            "plantModal"
        )
        .classList.remove(
            "show"
        );

}


/* =========================================================
   30. ADD PLANT
========================================================= */

function setupPlantForm() {

    document
        .getElementById(
            "plantForm"
        )
        .addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    document.getElementById(
                        "plantName"
                    ).value;


                const layer =
                    Number(
                        document.getElementById(
                            "plantLayer"
                        ).value
                    );


                const heightMin =
                    Number(
                        document.getElementById(
                            "heightMin"
                        ).value
                    );


                const heightMax =
                    Number(
                        document.getElementById(
                            "heightMax"
                        ).value
                    );


                const quantity =
                    Number(
                        document.getElementById(
                            "plantQuantity"
                        ).value
                    );


                const yieldPerTree =
                    Number(
                        document.getElementById(
                            "plantYield"
                        ).value
                    );


                const price =
                    Number(
                        document.getElementById(
                            "plantPrice"
                        ).value
                    );


                const harvestStart =
                    Number(
                        document.getElementById(
                            "harvestStart"
                        ).value
                    );


                const newPlant = {

                    id:
                        "plant-" +
                        Date.now(),

                    name:
                        name,

                    icon:
                        "🌱",

                    layer:
                        layer,

                    heightMin:
                        heightMin,

                    heightMax:
                        heightMax,

                    quantity:
                        quantity,

                    spacing:
                        2,

                    yieldPerTree:
                        yieldPerTree,

                    price:
                        price,

                    harvestStart:
                        harvestStart

                };


                plants.push(
                    newPlant
                );


                closePlantModal();


                renderPlantList();

                renderPlantTable();

                updateDashboard();

                updateHarvest();

                createPlants();

                updateIncomeChart();


                document
                    .getElementById(
                        "plantForm"
                    )
                    .reset();

            }
        );

}


/* =========================================================
   31. SAVE FARM
========================================================= */

function saveFarm() {

    const data =
        JSON.stringify(
            plants,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const a =
        document.createElement(
            "a"
        );


    a.href =
        url;


    a.download =
        "agroforestry-1rai.json";


    a.click();


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   32. RESET FARM
========================================================= */

function resetFarm() {

    const confirmReset =
        confirm(
            "ต้องการรีเซ็ตข้อมูลแปลงหรือไม่?"
        );


    if (
        !confirmReset
    ) {

        return;

    }


    location.reload();

}
