function incarcaPersoane() {
    var xhr = new XMLHttpRequest(); //creare obiect xhr pentru cerere AJAX
    xhr.open("GET", "resurse/persoane.xml", true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let xmlDoc = xhr.responseXML;

            // fallback daca responseXML e null
            if (!xmlDoc) {
                const parser = new DOMParser();
                xmlDoc = parser.parseFromString(xhr.responseText, "text/xml");  //parsam manual
            }

            const persoane = xmlDoc.getElementsByTagName("persoana");   //extragem doar nodul persoana

            let tabel = document.createElement("table");
            tabel.classList.add("persoane-tabel");  //clasa css pentru stilizare tabel

            tabel.innerHTML = `
                <tr>
                    <th>ID</th><th>Nume</th><th>Prenume</th><th>Vârstă</th><th>Email</th>
                    <th>Job</th><th>Telefon</th><th>Hobby</th><th>Adresă</th>
                </tr>`;

            for (let i = 0; i < persoane.length; i++) {
                let p = persoane[i];
                let id = p.getAttribute("id");
                let nume = p.getElementsByTagName("nume")[0].textContent;
                let prenume = p.getElementsByTagName("prenume")[0].textContent;
                let varsta = p.getElementsByTagName("varsta")[0].textContent;
                let email = p.getElementsByTagName("email")[0].textContent;
                let job = p.getElementsByTagName("job")[0].textContent;
                let telefon = p.getElementsByTagName("telefon")[0].textContent;
                let hobby = p.getElementsByTagName("hobby")[0].textContent;

                let adresaNode = p.getElementsByTagName("adresa")[0];
                let adresa = [...adresaNode.children].map(e => e.textContent).join(", ");

                let rand = document.createElement("tr");
                rand.innerHTML = `
                    <td>${id}</td>
                    <td>${nume}</td>
                    <td>${prenume}</td>
                    <td>${varsta}</td>
                    <td>${email}</td>
                    <td>${job}</td>
                    <td>${telefon}</td>
                    <td>${hobby}</td>
                    <td>${adresa}</td>`;
                
                tabel.appendChild(rand);
            }
            
            //inlocuim continut pagina cu tabelul creat mai sus
            document.getElementById("continut").innerHTML = "";
            document.getElementById("continut").appendChild(tabel);
        }
    };
    xhr.send(); //trimitem cererea catre server
}
