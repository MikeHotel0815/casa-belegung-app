# STAGE 1: Build der Vue.js-Anwendung
#---------------------------------------------------------------------
# Wir verwenden ein offizielles Node.js Image als Basis.
# 'alpine' ist eine leichtgewichtigere Version. Wählen Sie eine Node-Version,
# die mit Ihrem Projekt kompatibel ist (z.B. 18, 20, etc.).
FROM node:18-alpine AS builder

# Arbeitsverzeichnis im Container setzen
WORKDIR /app

# Kopiere package.json und package-lock.json (oder yarn.lock)
# Dies wird separat kopiert, um Docker's Layer-Caching zu nutzen.
# Wenn sich diese Dateien nicht ändern, wird der 'npm install'-Schritt
# beim erneuten Bauen aus dem Cache geladen.
COPY package*.json ./

# Installiere die Projekt-Abhängigkeiten
# Wenn Sie yarn verwenden, ersetzen Sie dies durch:
# COPY yarn.lock ./
# RUN yarn install --frozen-lockfile
RUN npm install

# Kopiere den restlichen Quellcode der Frontend-Anwendung
COPY . .

# Baue die Anwendung für die Produktion
# Der Skriptname 'build' ist üblich, könnte aber in Ihrer package.json anders lauten.
RUN npm run build

# STAGE 2: Servieren der gebauten Anwendung mit Nginx
#---------------------------------------------------------------------
# Wir verwenden ein offizielles Nginx Image.
# 'alpine' ist wieder für ein kleineres Image.
FROM nginx:stable-alpine

# Entferne die Standard Nginx Konfiguration
#RUN rm /etc/nginx/conf.d/default.conf

# Kopiere eine eigene Nginx Konfigurationsdatei (siehe Hinweis unten)
# Für den Anfang kann dies optional sein, wenn die Standardeinstellungen von Nginx ausreichen
# oder wenn Ihre Vue-App den Router im Hash-Modus verwendet.
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Kopiere die gebauten statischen Dateien aus dem 'builder'-Stage
# Der Pfad '/app/dist' ist der übliche Ausgabeordner für Vue-CLI-Projekte.
# Überprüfen Sie dies ggf. in Ihrer vue.config.js oder dem Build-Output.
COPY --from=builder /app/dist /usr/share/nginx/html

# Port, auf dem Nginx lauscht (Standard ist 80)
EXPOSE 80

# Starte Nginx, wenn der Container gestartet wird
# '-g "daemon off;"' stellt sicher, dass Nginx im Vordergrund läuft,
# was für Docker-Container erforderlich ist.
CMD ["nginx", "-g", "daemon off;"]