<div align="center">
  <h1>🧠 LOL-Mind-Api</h1>
  <p><i>Tu coach personal para la Grieta del Invocador impulsado por Inteligencia Artificial</i></p>
</div>

## 📖 Sobre el Proyecto

**LOL-Mind-Api** es una herramienta analítica y de asistencia para jugadores de League of Legends. A diferencia de las páginas de estadísticas tradicionales, este proyecto utiliza la **API de Gemini (IA)** y técnicas de **RAG (Generación Aumentada por Recuperación)** para analizar la composición completa de los equipos y sugerir ítems, runas y estrategias adaptadas al contexto específico de cada partida.

El sistema se mantiene actualizado automáticamente consumiendo los datos oficiales de **Riot Data Dragon**, y forma parte de un ecosistema moderno construido con React, Node.js, TypeScript y PostgreSQL.

## ✨ Características Principales

* **Análisis Contextual con IA:** Evalúa *matchups* y composiciones de equipo usando la IA de Gemini para ofrecer recomendaciones personalizadas.
* **Precisión con RAG:** Garantiza que la IA solo recomiende ítems y runas que existen en la versión actual del juego, eliminando el riesgo de "alucinaciones".
* **Sincronización Automática:** Detecta nuevos parches de Riot Games y actualiza la base de datos sin intervención manual.

## 🛠️ Tecnologías Utilizadas

* **Entorno de ejecución:** Node.js
* **Lenguaje:** TypeScript
* **Base de Datos:** PostgreSQL
* **ORM:** Prisma
* **Integraciones:** Gemini API, Riot Games Data Dragon API

## 🚀 Próximos Pasos

*(En construcción: Aquí se añadirán las instrucciones para clonar el repositorio, instalar dependencias con `npm install` y configurar el archivo `.env` local).*

## 🚀 Deploy en Render (Producción)

Este repositorio ya incluye un blueprint en `render.yaml` para desplegar como Web Service.

### 1) Crear servicio

1. En Render, crear un nuevo servicio desde este repositorio.
2. Elegir el blueprint automático de `render.yaml`.
3. Confirmar que los comandos sean:
  - Build Command: `npm ci && npm run build`
  - Start Command: `npm run start`

### 2) Variables de entorno requeridas

- `DATABASE_URL`
- `GEMINI_API_KEY`
- `CRON_SECRET`
- `CORS_ORIGIN`

Variables ya definidas por blueprint:

- `NODE_ENV=production`
- `DATABASE_SSL_REJECT_UNAUTHORIZED=true`

### 3) Migrations en arranque

El script `start` ejecuta automáticamente `prisma migrate deploy` antes de iniciar la API.
Esto asegura que el esquema en producción esté sincronizado con las migraciones versionadas.

### 4) Healthcheck

Render validará la API con el endpoint:

- `GET /health`

Si responde 200, el servicio queda marcado como saludable.

## ⚖️ Legal Disclaimer

> LOL-Mind-Api isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
