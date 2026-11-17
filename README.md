# 📅 Készenléti Beosztás és Ügyeletkezelő

Egy modern, könnyen telepíthető Készenléti Beosztás és Ügyeletkezelő webalkalmazás (**React + Node.js/Express** alapokon), amelyet kifejezetten arra terveztek, hogy több különböző csoport közösen, egy belső hálózaton tudja vezetni és kezelni a havi készenléti naptárát.

---

## ✨ Főbb Funkciók

* **👥 Többcsapatos Kezelés:** Tetszőleges számú csapat hozható létre. A legördülő menüből azonnal váltani lehet a csoportok között.
* **📱 Tagok és Elérhetőségek:** Csapattagok felvétele névvel, telefonszámmal és egyedi kijelölő színnel.
* **📅 Interaktív Havi Naptár:** Gyors naponkénti beosztás és módosítás egyetlen kattintással.
* **🔍 Mai Készenlétes Kijelzés:** A fejléces sávban azonnal látható az aktuális napra beosztott csapattag és elérhetősége.
* **💾 Központi Adattárolás:** A módosítások egy szerveroldali `data.json` fájlban tárolódnak, így a hálózaton minden felhasználónál valós időben ugyanaz az állapot jelenik meg.
* **🔒 Offline & Izolált Működés:** 100%-ban belső hálózaton futtatható internetkapcsolat nélkül.

---

## 🏗️ Architektúra

```text
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
