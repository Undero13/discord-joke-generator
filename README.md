# Discord Joke Bot / Bot z Żartami dla Discorda

Bot dla Discorda napisany w Node.js, który generuje i publikuje żarty przy użyciu darmowych modeli AI.

## Funkcje / Features

- Codzienny automatyczny żart na dedykowanym kanale
- Komenda `/żart` do wygenerowania żartu na żądanie
- Wykorzystuje darmowe API do generowania żartów
- Obsługa wielu awaryjnych źródeł żartów
- Automatyczne dodawanie tematycznych obrazków do żartów
- Inteligentne dopasowanie obrazków w oparciu o słowa kluczowe z żartu

## Instalacja / Installation

1. Sklonuj to repozytorium lub pobierz pliki
2. Zainstaluj zależności:

```bash
npm install
```

## Konfiguracja / Configuration

1. Utwórz aplikację Discord Bot w [Discord Developer Portal](https://discord.com/developers/applications)
   - Utwórz nową aplikację
   - Przejdź do sekcji "Bot" i kliknij "Add Bot"
   - Skopiuj token bota
   - W sekcji "OAuth2 > URL Generator", wybierz uprawnienia:
     - `bot` oraz `applications.commands`
     - Uprawnienia bota: `Send Messages`, `Use Slash Commands`
   - Skopiuj wygenerowany URL i użyj go, aby dodać bota na swój serwer

2. Zmień nazwę pliku `example.env` na `.env` i uzupełnij wymagane dane:
   - `DISCORD_TOKEN` - token twojego bota Discord
   - `JOKES_CHANNEL_ID` - ID kanału, na którym mają być publikowane codzienne żarty
   - `DAILY_JOKE_TIME` - godzina wysyłania codziennego żartu (format 24h: HH:MM)
   - `TIMEZONE` - strefa czasowa (domyślnie Europe/Warsaw)

## Uruchomienie / Running

Aby uruchomić bota:

```bash
npm start
```

## Użycie / Usage

- Komenda `/żart` - generuje i wyświetla nowy żart
- Codziennie o wyznaczonej godzinie, bot automatycznie publikuje nowy żart na skonfigurowanym kanale

## Rozwiązywanie problemów / Troubleshooting

- Upewnij się, że bot ma odpowiednie uprawnienia na kanale do wysyłania wiadomości
- Sprawdź poprawność tokena Discord w pliku `.env`
- Sprawdź, czy ID kanału jest poprawne
- W przypadku problemów z API, bot spróbuje użyć alternatywnych źródeł żartów
