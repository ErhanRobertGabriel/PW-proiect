// worker-ul va primi produsul si va trimite un mesaj inapoi la script-ul principal
onmessage = function(event) {
    const produs = event.data;

    // afisam un mesaj in consola browser-ului pentru a verifica activitatea worker-ului
    console.log("Product received by worker:", produs);

    // dupa ce a primit produsul, trimite un mesaj inapoi la scriptul principal
    postMessage("Produs adaugat: " + produs.nume);
};
