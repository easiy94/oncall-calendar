📅 Készenléti Beosztás és Ügyeletkezelő

Egy Készenléti Beosztás és Ügyeletkezelő webalkalmazás (React + Node.js/Express alapokon), amelyet kifejezetten arra terveztek, hogy több különböző csoport közösen, egy belső hálózaton tudja vezetni és kezelni a havi készenléti naptárát.

✨ Főbb Funkciók

👥 Többcsapatos Kezelés: Tetszőleges számú csapat hozható létre. A legördülő menüből azonnal váltani lehet a csoportok között.

📱 Tagok és Elérhetőségek: Csapattagok felvétele névvel, telefonszámmal és egyedi kijelölő színnel.

📅 Interaktív Havi Naptár: Gyors naponkénti beosztás és módosítás egyetlen kattintással.

🔍 Mai Készenlétes Kijelzés: A fejléces sávban azonnal látható az aktuális napra beosztott csapattag és elérhetősége.

💾 Központi Adattárolás: A módosítások egy szerveroldali data.json fájlban tárolódnak, így a hálózaton minden felhasználónál valós időben ugyanaz az állapot jelenik meg.

🔒 Offline & Izolált Működés: 100%-ban belső hálózaton futtatható.

🏗️ Architektúra

  [ Böngészők / Belső Gépek ]
              │
              ▼ (HTTP / API)
   ┌──────────────────────┐
   │    Node.js Szerver   │
   │ ┌──────────────────┐ │
   │ │  Express Backend │ │
   │ └────────┬─────────┘ │
   │          │ (Kiszolgálja)
   │ ┌────────▼─────────┐ │
   │ │ React Frontend   │ │
   │ │   (dist mappa)   │ │
   │ └──────────────────┘ │
   └──────────┬───────────┘
              │ (Mentés/Betöltés)
              ▼
        [ data.json ]


🚀 Futtatás és Telepítés

1. Opció: Használat Dockerrel (Ajánlott)

Ha rendelkezésedre áll egy Docker környezet, az alkalmazást egyetlen konténerben elindíthatod.

🛠️ Image Építése (Offline / Pre-built dist esetén)

Ha a frontendet korábban már lebuiltelted (npm run build), a projekt gyökerében lévő Dockerfile-t használd!:

docker build -t keszenlet-app .


🏃‍♂️ Konténer Indítása

Futtasd az alábbi parancsot. A -v kapcsoló gondoskodik arról, hogy az adatok megmaradjanak a gépeden a konténer újraindítása után is:

docker run -d \
  -p 3000:3000 \
  -v $(pwd)/data:/app/data \
  --name keszenlet-container \
  keszenlet-app


Ezután az alkalmazás elérhető a http://<SZERVER_IP>:3000 címen.

2. Opció: Hagyományos Node.js Futtatás (Docker nélkül)

Ha nem használsz Dockert, hanem közvetlenül egy Node.js szerveren futtatod az alkalmazást:

📂 Könyvtárstruktúra

Győződj meg róla, hogy a lefordított dist/ mappa a server.js mellett található:

📁 keszenlet-app/
├── 📁 dist/             <-- Az npm run build által generált kimeneti mappa
├── 📁 node_modules/
├── server.js            <-- Express backend szerver
├── package.json
└── data.json            <-- Az adatok automatikusan ide mentődnek


⚙️ Lépések:

Buildelés (fejlesztői gépen):

npm run build


Másolás a szerverre: Másold át a dist/ mappát, a server.js-t és a package.json-t a célgépre.

Függőségek telepítése:

npm install --production

Szerver indítása:

node server.js

🛠️ Használt Technólogiák

Frontend: React 19, Tailwind CSS v4, Vite

Backend: Node.js, Express.js

Adatréteg: Lokális JSON alapú adattárolás (fs)

Konténerizáció: Docker (Alpine Linux alapon)

📜 Licensz

Ez a projekt szabadon felhasználható és módosítható belső céges vagy személyes célokra. (MIT License)
