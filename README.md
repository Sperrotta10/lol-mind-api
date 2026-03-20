<div align="center">
  <h1>LOL-Mind-Api</h1>
  <p><i>Tu coach personal para la Grieta del Invocador impulsado por IA + RAG</i></p>
</div>

## Sobre el proyecto

LOL-Mind-Api es una API backend para analisis de League of Legends. Usa Gemini para recomendaciones contextuales y RAG para asegurar que las respuestas esten alineadas a datos reales de Riot Data Dragon (items, runas, campeones y version activa).

## Caracteristicas principales

- Analisis contextual de matchup 1v1.
- Analisis de composicion 5v5 con recomendaciones para tu campeon.
- Builds base y builds por estilo.
- Sincronizacion manual y automatica de datos de Riot.
- Documentacion OpenAPI 3.0 con Swagger UI.

## Stack tecnologico

- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM
- Gemini API
- Riot Data Dragon API

## Requisitos previos

- Node.js 20+ recomendado
- npm 10+ recomendado
- PostgreSQL disponible (local o cloud)
- API Key de Gemini

## Instalacion y configuracion inicial

1. Clonar el repositorio

```bash
git clone https://github.com/Sperrotta10/lol-mind-api.git
cd lol-mind-api
```

2. Instalar dependencias

```bash
npm install
```

3. Crear archivo .env en la raiz

```env
PORT=3000
NODE_ENV=development

DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public"
DATABASE_SSL_REJECT_UNAUTHORIZED=false

GEMINI_API_KEY="TU_GEMINI_API_KEY"
CORS_ORIGIN="http://localhost:5173"
CRON_SECRET="un_secreto_largo_para_el_endpoint_de_cron"
```

4. Generar cliente Prisma y aplicar migraciones

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Levantar el servidor en desarrollo

```bash
npm run dev
```

6. Verificar estado de la API

```bash
curl http://localhost:3000/health
```

## Scripts disponibles

- `npm run dev`: ejecuta la API en modo desarrollo con watch.
- `npm run start`: aplica migraciones pendientes y arranca la API.
- `npm run build`: genera Prisma Client.
- `npm run prisma:migrate`: crea y aplica migracion en desarrollo.
- `npm run prisma:generate`: genera cliente de Prisma.
- `npm run prisma:deploy`: aplica migraciones en entorno productivo.

## Swagger (OpenAPI)

- UI interactiva: `http://localhost:3000/api/docs`
- JSON OpenAPI: `http://localhost:3000/api/docs.json`

La documentacion se genera desde anotaciones `@openapi` en las rutas de `src/routes` y en `src/index.ts` para healthcheck.

## Endpoints

Base URL local: `http://localhost:3000`

### Health

- `GET /health`
  - Descripcion: verifica que la API este activa.
  - Respuesta 200: estado, uptime, timestamp y requestId.

### Riot

- `POST /api/riot/sync`
  - Descripcion: fuerza sincronizacion manual con Riot Data Dragon.
  - Respuesta 200: version, championsSynced, itemsSynced, runesSynced.

### Champions

- `GET /api/champions`
  - Descripcion: lista campeones guardados en DB.
  - Query opcional:
    - `search`: filtra por nombre o id.
    - `tag`: filtra por rol/tag (Fighter, Mage, Tank, etc).
  - Respuesta 200: arreglo de campeones.

Ejemplo:

```bash
curl "http://localhost:3000/api/champions?search=ahri&tag=Mage"
```

### Builds

- `POST /api/builds/matchup`
  - Descripcion: analiza un enfrentamiento 1v1 y devuelve recomendacion de build.
  - Body:

```json
{
  "champion": "Ahri",
  "enemy": "Zed"
}
```

- `POST /api/builds/team-analysis`
  - Descripcion: analiza composicion 5v5 y recomienda build para tu campeon.
  - Body:

```json
{
  "myTeam": ["Garen", "LeeSin", "Ahri", "Jinx", "Leona"],
  "enemyTeam": ["Darius", "Viego", "Zed", "KaiSa", "Nautilus"],
  "myChampion": "Ahri"
}
```

- `POST /api/builds/style`
  - Descripcion: genera build theorycrafting por estilo.
  - Body:

```json
{
  "champion": "Garen",
  "style": "Letalidad"
}
```

- `GET /api/builds/base/:champion`
  - Descripcion: genera build base meta para un campeon.

Ejemplo:

```bash
curl "http://localhost:3000/api/builds/base/Garen"
```

## Flujo recomendado despues de instalar

1. Levantar API con `npm run dev`.
2. Ejecutar `POST /api/riot/sync` una vez para poblar datos iniciales.
3. Abrir Swagger en `/api/docs` y probar endpoints.

## ⚖️ Legal Disclaimer

> LOL-Mind-Api isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
