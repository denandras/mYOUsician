# Adattárolás és Biztonság

Utolsó frissítés: 2025. július 9.

## Áttekintés

Ez a dokumentum elmagyarázza, hogyan tárolja, dolgozza fel és védi a mYOUsician az Ön adatait. Olyan platformként, amely bizonyos felhasználói információkat nyilvánosan elérhetővé tesz, hiszünk az adatkezelési gyakorlataink átláthatóságában.

## Hol Tárolódnak az Adatai

### Felhő Infrastruktúra

- **Adatbázis Szolgáltató**: A [Supabase](https://supabase.com/)-t használjuk, amely egy biztonságos és GDPR-megfelelő adatbázis platform
- **Adatok Helyszíne**: Minden adat az Európai Unióban található szervereken tárolódik

### Helyi Fejlesztés

- Korlátozott adatfeldolgozás történik a fejlesztő biztonságos helyi fejlesztői környezetében
- Nincs termelési adat hosszabb ideig helyileg tárolva

## Adatbiztonsági Intézkedések

### Hitelesítés és Hozzáférés

- **Felhasználói Hitelesítés**: Iparági szabványú hitelesítési mechanizmusok védik a felhasználói fiókokat
- **Jogosultság Ellenőrzések**: Szigorú hozzáférés-vezérlés korlátozza, ki módosíthatja az adatokat
- **Fejlesztői Hozzáférés**: Csak a platform fejlesztője rendelkezik közvetlen adatbázis hozzáféréssel

### Titkosítás

- **Adatok Átvitelben**: Minden adat, amely a böngészője és szervereink között továbbítódik, HTTPS/TLS titkosítással védett
- **Érzékeny Adatok**: A jelszavak hashelve vannak és soha nem tárolódnak tiszta szövegként
- **API Biztonság**: Minden API kérés megfelelő hitelesítést igényel

### Harmadik Fél Biztonság

- **Supabase Biztonság**: Az adatbázis szolgáltatónk további biztonsági intézkedéseket implementál, beleértve:
  - Adatbázis titkosítás
  - Hálózati izolálás
  - Rendszeres biztonsági auditok
  - Biztonsági szabványoknak való megfelelés

## Adatfeldolgozás

### Nyilvános Adatok Feldolgozása

- A nyilvános profil információk úgy kerülnek feldolgozásra és tárolásra, hogy optimalizálják a keresési funkcionalitást
- Az adatbázis úgy van strukturálva, hogy hatékony szűrést tegyen lehetővé zenei műfajok, hangszerek és egyéb kritériumok szerint
- A nyilvános adatok átmenetileg gyorsítótárazásra kerülnek a teljesítmény javítása érdekében

### Privát Adatok Feldolgozása

- A fiókkezelési adatok elkülönítve tárolódnak a nyilvános profil információktól
- A hitelesítési adatok biztonságos, bevált hitelesítési folyamatokon keresztül kezelődnek

## Incidensre Reagálás

Adatszivárgás valószínűtlen esetén:

1. Azonnal azonosítjuk és kezeljük az okot
2. A felhasználókat 72 órán belül értesítjük, ha személyes adatok érintettek
3. A megfelelő hatóságokat értesítjük, ahogy azt a törvény előírja
4. Lépéseket teszünk hasonló incidensek megelőzésére

## Biztonsági Korlátozások

Egyéni fejlesztő által üzemeltetett szolgáltatásként:

- A biztonsági monitorozási erőforrások korlátozottabbak, mint nagy szervezeteknél
- Előnyben részesítjük a bevált, biztonságos platformok (Supabase, Next.js) használatát, hogy kihasználjuk biztonsági szakértelmüket
- Követjük a biztonsági legjobb gyakorlatokat, de nem tudjuk garantálni az abszolút biztonságot

## Technikai Megvalósítási Részletek

- **Adatbázis**: PostgreSQL (Supabase-en keresztül)
- **Hitelesítés**: Supabase Auth (OAuth és e-mail alapú hitelesítés)
- **Alkalmazás Biztonság**: Next.js biztonsági legjobb gyakorlatok
- **Infrastruktúra**: Szerver nélküli architektúra minimális támadási felülettel

## Kérdések vagy Aggodalmak

Ha kérdései vannak adattárolási vagy biztonsági gyakorlatainkkal kapcsolatban, kérjük, vegye fel a kapcsolatot:
- E-mail: myousician.app@gmail.com

---

Ez a dokumentum kiegészíti Adatvédelmi Nyilatkozatunkat és Általános Szerződési Feltételeinket, amelyek további információkat nyújtanak arról, hogyan gyűjtjük és használjuk az adatait.
