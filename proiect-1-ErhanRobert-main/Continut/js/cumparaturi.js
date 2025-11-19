// constructor pentru produs
function Produs(nume, cantitate, id) {
    this.nume = nume;
    this.cantitate = cantitate;
    this.id = id;
}

// functia care adauga produsul in lista
function adaugaProdus(event) {
    event.preventDefault();

    const numeProdus = document.getElementById('numeProdus').value;
    const cantitate = document.getElementById('cantitate').value;

    // verificam daca campurile nu sunt goale
    if (!numeProdus || !cantitate) {
        alert("Completeaza toate campurile!");
        return;
    }

    // creare produs
    const produsNou = new Produs(numeProdus, cantitate, Date.now());

    // obtinem lista de produse salvate din localStorage
    let produse = JSON.parse(localStorage.getItem('produse')) || [];

    // adaugam produsul in lista
    produse.push(produsNou);

    // salvam lista actualizata în localStorage
    localStorage.setItem('produse', JSON.stringify(produse));

    // actualizam lista de produse afisata
    afiseazaProduse();
}

// functia care afiseaza produsele din lista
function afiseazaProduse() {
    const lista = document.getElementById('listaCumparaturi');
    lista.innerHTML = ""; // Golește lista existentă

    // obtinem lista de produse din localStorage
    const produse = JSON.parse(localStorage.getItem('produse')) || [];

    // adaugam fiecare produs în lista
    produse.forEach(produs => {
        const li = document.createElement('li');
        li.textContent = `Produs: ${produs.nume}, Cantitate: ${produs.cantitate}`;
        lista.appendChild(li);
    });
}

// functie care se executa la incarcare
function initCumparaturi() {
    // sterge lista de produse din localStorage la incarcarea paginii
    localStorage.removeItem('produse'); 

    // afisam lista (care va fi goala deoarece am sters produsele)
    afiseazaProduse();

    // legam formularul la functia de adaugare a produsului
    const formular = document.getElementById('formularCumparaturi');
    formular.addEventListener('submit', adaugaProdus);
}

// apelam functia de initializare cand este incarcata pagina
initCumparaturi();
