const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const app = express();
const port = 6789;

const accesariGresite = {};

app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'secret123',
  resave: false,
  saveUninitialized: true
}));

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'parola123',
  database: 'cumparaturi',
  multipleStatements: true
};

let pool;
(async () => {
  pool = await mysql.createPool(dbConfig);
})();

const utilizatoriPath = path.join(__dirname, 'public', 'utilizatori.json');
let utilizatori = [];
try {
  const data = fs.readFileSync(utilizatoriPath, 'utf8');
  utilizatori = JSON.parse(data);
} catch (err) {
  console.error('Eroare la citirea utilizatori.json:', err);
}

// variabile transmise catre layout
app.use((req, res, next) => {
  res.locals.utilizator = req.session.utilizator || null;
  res.locals.mesaj = req.session.mesaj || null;
  res.locals.mesajBlocareIP = req.session.mesajBlocareIP || null;
  req.session.mesaj = null;
  req.session.mesajBlocareIP = null;
  next();
});

function citesteIntrebari(callback) {
  fs.readFile('intrebari.json', 'utf8', (err, data) => {
    if (err) return callback(err);
    callback(null, JSON.parse(data));
  });
}

function verificaAutentificare(req, res, next) {
  if (!req.session.utilizator) return res.redirect('/autentificare');
  next();
}

function verificaAdmin(req, res, next) {
  if (req.session.utilizator && req.session.utilizator.rol === 'ADMIN') {
    next();
  } else {
    req.session.mesaj = 'Acces interzis: doar pentru ADMIN';
    res.redirect('/');
  }
}

app.get('/', async (req, res) => {
  try {
    const [produse] = await pool.query('SELECT * FROM produse');
    res.render('index', { produse });
  } catch (err) {
    console.error('Eroare la select produse:', err.message);
    res.render('index', { produse: [] });
  }
});

app.get('/admin', verificaAutentificare, verificaAdmin, (req, res) => {
  res.render('admin');
});

app.post('/admin/adauga-produs', verificaAutentificare, verificaAdmin, async (req, res) => {
  const { nume, pret, categorie } = req.body;
  if (!nume || !pret || !categorie) {
    req.session.mesaj = 'Toate câmpurile sunt obligatorii!';
    return res.redirect('/');
  }

  try {
    await pool.query('INSERT INTO produse (nume, pret, categorie) VALUES (?, ?, ?)', [nume, pret, categorie]);
    req.session.mesaj = 'Produs adăugat cu succes!';
    res.redirect('/');
  } catch (err) {
    console.error('Eroare la adăugare produs:', err);
    req.session.mesaj = 'Eroare la adăugare produs!';
    res.redirect('/');
  }
});

app.get('/creare-bd', async (req, res) => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'parola123',
    multipleStatements: true
  });

  const query = `
    CREATE DATABASE IF NOT EXISTS cumparaturi;
    USE cumparaturi;
    CREATE TABLE IF NOT EXISTS produse (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nume VARCHAR(100),
      pret DECIMAL(10,2),
      categorie VARCHAR(50)
    );
  `;

  try {
    await connection.query(query);
    req.session.mesaj = 'Baza de date a fost creată!';
    res.redirect('/');
  } catch (err) {
    console.error('Eroare la creare BD:', err);
    req.session.mesaj = 'Eroare la creare BD';
    res.redirect('/');
  } finally {
    await connection.end();
  }
});

app.get('/inserarebd', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) AS total FROM produse');
    if (rows[0].total > 0) {
      req.session.mesaj = 'Produsele există deja.';
      return res.redirect('/');
    }

    const produse = [
      ['Caiet matematică', 5.99, 'Hârtie'],
      ['Caiet dictando', 6.50, 'Hârtie'],
      ['Stilou', 32.75, 'Instrumente de scris'],
      ['Pix', 2.50, 'Instrumente de scris'],
      ['Trusă geometrie', 20.45, 'Instrumente matematice']
    ];

    await pool.query('INSERT INTO produse (nume, pret, categorie) VALUES ?', [produse]);
    req.session.mesaj = 'Produsele au fost inserate cu succes!';
    res.redirect('/');
  } catch (err) {
    console.error('Eroare inserare produse:', err);
    req.session.mesaj = 'Eroare la inserare produse!';
    res.redirect('/');
  }
});

app.post('/adaugare_cos', async (req, res) => {
  const id = parseInt(req.body.id);
  if (!req.session.utilizator) return res.status(403).send('Trebuie să fii autentificat.');
  if (!req.session.cos) req.session.cos = [];

  try {
    const [rows] = await pool.query('SELECT * FROM produse WHERE id = ?', [id]);
    if (rows.length > 0) req.session.cos.push(rows[0]);
    res.redirect('/');
  } catch (err) {
    console.error('Eroare adăugare în coș:', err);
    res.status(500).send('Eroare server');
  }
});

app.get('/cos', (req, res) => {
  const cos = req.session.cos || [];
  res.render('vizualizare-cos', { cos });
});

app.post('/sterge-din-cos', (req, res) => {
  const { nume } = req.body;
  req.session.cos = (req.session.cos || []).filter(p => p.nume !== nume);
  res.redirect('/cos');
});

app.get('/autentificare', (req, res) => {
  const mesajEroare = req.session.mesajEroare;
  req.session.mesajEroare = null;
  res.render('autentificare', { mesajEroare });
});

app.post('/verificare-autentificare', (req, res) => {
  const { utilizator, parola } = req.body;
  const user = utilizatori.find(u => u.username === utilizator && u.parola === parola);

  if (user) {
    const { parola, ...userFaraParola } = user;
    req.session.utilizator = userFaraParola;
    res.redirect('/');
  } else {
    req.session.mesajEroare = 'Utilizator sau parolă greșită';
    res.redirect('/autentificare');
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/chestionar', (req, res) => {
  citesteIntrebari((err, intrebari) => {
    if (err) return res.status(500).send('Eroare chestionar');
    res.render('chestionar', { intrebari });
  });
});

app.post('/rezultat-chestionar', (req, res) => {
  citesteIntrebari((err, intrebari) => {
    if (err) return res.status(500).send('Eroare rezultate');
    const raspunsuri = req.body.raspunsuri;
    let scor = 0;

    intrebari.forEach((intrebare, i) => {
      if (raspunsuri && raspunsuri[i] == intrebare.corect) scor++;
    });

    res.render('rezultat-chestionar', { scor, total: intrebari.length });
  });
});

//accesare rute inexistente
app.use((req, res) => {
  const ip = req.ip;

  if (!accesariGresite[ip]) {
    accesariGresite[ip] = { count: 0, blockedUntil: 0 };
  }

  if (accesariGresite[ip].blockedUntil > Date.now()) {
    req.session.mesajBlocareIP = 'IP-ul este blocat pentru următoarele 10 secunde.';
    return res.redirect('/');
  }

  accesariGresite[ip].count++;

  if (accesariGresite[ip].count >= 5) {
    accesariGresite[ip].blockedUntil = Date.now() + 10000;
    accesariGresite[ip].count = 0;
    req.session.mesajBlocareIP = 'IP-ul este blocat pentru următoarele 10 secunde.';
  } else {
    req.session.mesaj = 'Pagina nu a fost găsită.';
  }

  res.redirect('/');
});

app.listen(port, () => {
  console.log(`Serverul rulează la http://localhost:${port}`);
});
