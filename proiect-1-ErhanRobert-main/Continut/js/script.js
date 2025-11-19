function initInvata() {
    //eveniment de click pentru fiecare link cu clasa css custom-link
    document.querySelectorAll(".custom-link").forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            let targetId = this.getAttribute("href").substring(1);  //luam id-ul sectiunii pe care dorim sa o accesam
            let targetSection = document.getElementById(targetId);

            if (targetSection) {
                //ascundem sectiunile initial
                document.querySelectorAll("main section").forEach(section => {
                    section.style.display = "none";
                });
                
                //daca nu e sectiunea 1,golim info
                if (targetId !== "sectiune1") {
                    let info = document.getElementById("info");
                    if (info) 
                    {
                        info.innerHTML = "";
                    }
                }

                //daca nu e sectiunea 2,golim canvas
                if (targetId !== "sectiune2") {
                    let canvas = document.getElementById("desenCanvas");
                    if (canvas) {
                        let ctx = canvas.getContext("2d");
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                }

                targetSection.style.display = "block";  //afisam doar sectiunea ceruta

                //apelare functii pentru fiecare sectiune in parte
                if (targetId === "sectiune1") {
                    afiseazaInformatii();
                } else if (targetId === "sectiune2") {
                    initCanvas();
                } else if (targetId === "sectiune3") {
                    initTabel();
                }
            }
        });
    });
}

function afiseazaInformatii() {
    let info = document.getElementById("info");
    let lat = "Necunoscut";
    let lon = "Necunoscut";

    let sectiune = document.getElementById("sectiune1");
    sectiune.style.display = "block";   //ne asiguram ca sectiunea este vizibila

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            lat = position.coords.latitude;
            lon = position.coords.longitude;
            actualizeazaInformatii(lat, lon);   //afisam datele dupa ce obtinem pozitia
        }, function() {
            actualizeazaInformatii(lat, lon);
        });
    } else {
        actualizeazaInformatii(lat, lon);
    }

    function actualizeazaInformatii(lat, lon) {
        //extragem informatiile necesare
        let dataCurenta = new Date().toLocaleString();
        let urlPagina = window.location.href;
        let browser = navigator.userAgent;
        let sistemOperare = navigator.platform;

        info.innerHTML = ` 
            <strong>Data și ora curentă:</strong> <span id="dataTimp">${dataCurenta}</span> <br>
            <strong>URL pagină:</strong> ${urlPagina} <br>
            <strong>Browser:</strong> ${browser} <br>
            <strong>Sistem de operare:</strong> ${sistemOperare} <br>
            <strong>Locație curentă:</strong> Latitudine ${lat}, Longitudine ${lon} <br>
        `;
    }

    //actualizam ora la fiecare secunda
    setInterval(() => {
        document.getElementById("dataTimp").textContent = new Date().toLocaleString();
    }, 1000);
}

function initCanvas() {
    let canvas = document.getElementById("desenCanvas");
    if (!canvas) return;

    let ctx = canvas.getContext("2d");
    let culoareContur = document.getElementById("culoareContur");
    let culoareUmplere = document.getElementById("culoareUmplere");
    let puncte = [];

    function deseneazaDreptunghi(p1, p2) {
        let x = Math.min(p1.x, p2.x);
        let y = Math.min(p1.y, p2.y);
        let latime = Math.abs(p1.x - p2.x);
        let inaltime = Math.abs(p1.y - p2.y);

        ctx.fillStyle = culoareUmplere.value;
        ctx.strokeStyle = culoareContur.value;

        ctx.fillRect(x, y, latime, inaltime);
        ctx.strokeRect(x, y, latime, inaltime);
    }

    //eveniment de click pe canvas
    canvas.addEventListener("click", function(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        puncte.push({ x, y });  //salvam punctul pe care apasam click

        if (puncte.length === 2) {
            deseneazaDreptunghi(puncte[0], puncte[1]);  //desenam cand avem doua puncte
            puncte = [];    //resetare lista puncte
        }
    });

    //functionalitate buton de curata
    let clearBtn = document.getElementById("clearCanvas");
    if (clearBtn) {
        clearBtn.onclick = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);   //stergem ce am desenat
            deseneazaFormeInitiale();   //pastram figurile initiale
        };
    }

    function deseneazaFormeInitiale() {
        ctx.fillStyle = "#00ff00";
        ctx.strokeStyle = "#000";
        ctx.fillRect(50, 50, 100, 100);
        ctx.strokeRect(50, 50, 100, 100);

        ctx.fillStyle = "#ff9900";
        ctx.fillRect(200, 100, 120, 120);
        ctx.strokeRect(200, 100, 120, 120);
    }

    deseneazaFormeInitiale();
}

function initTabel() {
    console.log("Secțiunea 3 activă - inițializare tabel");
}

function adaugaLinie() {
    let tabel = document.getElementById("tabelModificabil");
    let pozitie = parseInt(document.getElementById("pozitie").value);
    let culoare = document.getElementById("culoare").value;

    if (!tabel || pozitie < 0 || pozitie > tabel.rows.length) {
        alert("Poziția liniei este invalidă!");
        return;
    }

    let linieNoua = tabel.insertRow(pozitie);
    for (let i = 0; i < tabel.rows[0].cells.length; i++) {
        let celula = linieNoua.insertCell(i);
        celula.textContent = `Nou`;
        celula.style.backgroundColor = culoare;
    }
}

function adaugaColoana() {
    let tabel = document.getElementById("tabelModificabil");
    let pozitie = parseInt(document.getElementById("pozitie").value);
    let culoare = document.getElementById("culoare").value;

    if (!tabel || pozitie < 0 || pozitie > tabel.rows[0].cells.length) {
        alert("Poziția coloanei este invalidă!");
        return;
    }

    for (let i = 0; i < tabel.rows.length; i++) {
        let celulaNoua = tabel.rows[i].insertCell(pozitie);
        celulaNoua.textContent = `Nou`;
        celulaNoua.style.backgroundColor = culoare;
    }
}
