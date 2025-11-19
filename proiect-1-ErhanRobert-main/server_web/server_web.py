import os
import socket
import gzip
import threading

# functie care se ocupa de fiecare client
def handle_client(clientsocket, address):
    print(f'S-a conectat un client de la {address}')

    cerere = ''
    linieDeStart = ''

    # request HTTP
    while True:
        data = clientsocket.recv(1024)
        cerere += data.decode()
        if '\r\n' in cerere:
            linieDeStart = cerere.split('\r\n')[0]  #prima linie din request
            break

    print(f'S-a citit linia de start din cerere: ##### {linieDeStart} #####')

    # extragem resursa ceruta din linia de start
    resursa = linieDeStart.split(' ')[1]
    if resursa == '/':
        resursa = '/index.html' #fallback implicit la index

    # construim calea catre fisier
    fisier = f'D:/Facultate/An 3/Semestrul 2/PW/proiect-1-ErhanRobert/continut{resursa}'
    print(f'Se caută fișierul: {fisier}')

    if os.path.exists(fisier):
        with open(fisier, 'rb') as f:
            continut = f.read()

        # determinam tipul de continut
        tip_continut = 'application/octet-stream'
        if resursa.endswith('.html'):
            tip_continut = 'text/html'
        elif resursa.endswith('.css'):
            tip_continut = 'text/css'
        elif resursa.endswith('.js'):
            tip_continut = 'application/javascript'
        elif resursa.endswith('.ico'):
            tip_continut = 'image/x-icon'

        # compresie GZIP pentru HTML, CSS si JS
        if tip_continut in ['text/html', 'text/css', 'application/javascript']:
            continut = gzip.compress(continut)
            header_encoding = "Content-Encoding: gzip\r\n"
        else:
            header_encoding = ""

        # construim raspunsul HTTP
        raspuns = (
            f"HTTP/1.1 200 OK\r\n"
            f"Content-Type: {tip_continut}\r\n"
            f"{header_encoding}"
            f"Content-Length: {len(continut)}\r\n"
            f"\r\n"
        ).encode()

        #trimitem headere si continutul fisierului
        clientsocket.sendall(raspuns)
        clientsocket.sendall(continut)

    else:
        # eroare 404 dacă fisierul nu exista
        raspuns = "HTTP/1.1 404 Not Found\r\n\r\nPagina nu a fost găsită".encode()
        clientsocket.sendall(raspuns)

    #inchidem conexiunea cu clientul
    clientsocket.close()
    print(f'S-a terminat comunicarea cu clientul {address}')

# initializam serverul
serversocket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
serversocket.bind(('', 5678))
serversocket.listen(5)

print("Serverul ascultă pe portul 5678...")

# acceptam clienti si ii procesam in paralel cu threading
while True:
    clientsocket, address = serversocket.accept()
    #pentru fiecare client pornim un fir de executie nou
    client_thread = threading.Thread(target=handle_client, args=(clientsocket, address))
    client_thread.start()
