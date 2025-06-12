# Instrukcja uruchomienia projektu

## 1. Pobranie modułów

Uruchom w terminalu poniższe polecenie, aby zainstalować wszystkie niezbędne zależności:

```bash
pnpm install
```

---

## 2. Instalacja certyfikatów SSL dla Nuxt Dev Server

Aby umożliwić działanie serwera deweloperskiego Nuxt na HTTPS, wykonaj następujące kroki:

### a) Pobierz i zainstaluj narzędzie `mkcert`

Narzędzie `mkcert` pozwala tworzyć lokalne certyfikaty SSL zaufane przez system.

Pobierz `mkcert` ze strony:  
[https://github.com/FiloSottile/mkcert/releases](https://github.com/FiloSottile/mkcert/releases)

### b) Zainstaluj lokalny urząd certyfikacji (CA)

W terminalu wykonaj:

```bash
mkcert -install
```

### c) Wygeneruj certyfikaty dla `localhost`

W folderze z projektem uruchom:

```bash
mkcert localhost
```

W wyniku powstaną dwa pliki certyfikatów, które należy umieścić w katalogu projektu.

---

## 3. Uruchomienie projektu

Po zainstalowaniu zależności i certyfikatów, uruchom serwer developerski Nuxt poleceniem:

```bash
pnpm dev
```

---

**Gotowe!** Teraz możesz otworzyć projekt w przeglądarce pod adresem `https://localhost` z obsługą HTTPS.
