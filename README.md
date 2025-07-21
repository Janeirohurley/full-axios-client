# @janeirohurley/full-axios-client

A fully customizable Axios client with support for multiple authentication types and flexible token storage strategies. Perfect for working with any API, including the **Kirundi Forger backend**.

![npm](https://img.shields.io/npm/v/@janeirohurley/full-axios-client?color=blue)
![License](https://img.shields.io/npm/l/@janeirohurley/full-axios-client?color=green)
![Downloads](https://img.shields.io/npm/dw/@janeirohurley/full-axios-client)

---

## ✨ Features

- ✅ Configurable **base URL** for API requests
- 🔒 Multiple **authentication types**:
  - Bearer token (e.g., JWT)
  - OAuth2 (client credentials, auth code, refresh token)
  - API Key
  - Custom headers
- 📦 Flexible **token storage**:
  - `localStorage`, `sessionStorage`, cookies, or custom
- 💡 Full **TypeScript support**
- 🔁 Automatic OAuth2 **token refresh**
- 🛠️ Compatible with `npm`, `yarn`, and `pnpm`

---

## 📦 Installation

\`\`\`bash
# npm
npm install @janeirohurley/full-axios-client

# yarn
yarn add @janeirohurley/full-axios-client

# pnpm
pnpm add @janeirohurley/full-axios-client
\`\`\`

---

## 🚀 Usage

### ➤ Basic (Bearer Token with \`localStorage\`)

\`\`\`ts
// Importation du client axios personnalisé
import { createApiClient } from '@janeirohurley/full-axios-client';

// Création du client avec authentification par token stocké dans localStorage
const api = createApiClient({
  baseURL: 'your-api', // Remplacer par l'URL de votre API
  auth: {
    type: 'bearer', // Type d'authentification : Bearer Token
    tokenKey: 'access', // Clé du token dans le localStorage
  },
});

// Appel GET simple
api.get('/words').then(console.log).catch(console.error);
\`\`\`

---

### ➤ OAuth2 (Client Credentials)

\`\`\`ts
// Création d’un client configuré pour OAuth2 avec client credentials
const api = createApiClient({
  baseURL: 'your-api',// Remplacer par l'URL de votre API
  auth: {
    type: 'oauth2', 
    tokenKey: 'access_token', // Clé sous laquelle le token est récupéré dans la réponse
    oauth2: {
      tokenUrl: 'https://auth-server.com/oauth/token', // URL du serveur d’auth
      clientId: 'your-client-id', // ID client
      clientSecret: 'your-client-secret', // Secret client
      grantType: 'client_credentials', // Type de flux OAuth
      scope: 'api:read api:write', // Scopes d’accès
    },
  },
});
\`\`\`

---

### ➤ API Key Authentication

\`\`\`ts
// Utilisation d’une clé API dans un header personnalisé
const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'apiKey', // Authentification par clé API
    apiKey: 'your-api-key', // La clé API elle-même
    customHeader: 'X-API-Key', // Le nom du header où envoyer la clé
  },
});
\`\`\`

---

### ➤ Custom Authentication Header

\`\`\`ts
// Ajout d’un header personnalisé avec une valeur fixe pour l’authentification
const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'custom', // Type personnalisé
    customHeader: 'X-Custom-Auth', // Nom du header
    customAuthValue: 'your-custom-value', // Valeur fixe d’authentification
  },
});
\`\`\`

---

### ➤ Custom Storage (sessionStorage)

\`\`\`ts
// Définition d’un système de stockage personnalisé basé sur sessionStorage
const sessionStorageImpl = {
  getItem: (key: string) => sessionStorage.getItem(key), // Lecture
  setItem: (key: string, value: string) => sessionStorage.setItem(key, value), // Écriture
  removeItem: (key: string) => sessionStorage.removeItem(key), // Suppression
};

// Utilisation du client avec sessionStorage comme support de token
const api = createApiClient({
  baseURL: 'your-api',
  storage: sessionStorageImpl, // Remplacement du stockage par défaut
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});
\`\`\`

---

### ➤ Cookie Storage (with \`js-cookie\`)

\`\`\`bash
# Installer js-cookie pour la gestion des cookies
npm install js-cookie
\`\`\`

\`\`\`ts
// Implémentation d’un système de stockage via cookies
import Cookies from 'js-cookie';

const cookieStorage = {
  getItem: (key: string) => Cookies.get(key) || null, // Lecture du cookie
  setItem: (key: string, value: string) => Cookies.set(key, value, { expires: 7 }), // Stockage (7 jours)
  removeItem: (key: string) => Cookies.remove(key), // Suppression
};

// Utilisation du client avec cookies comme système de stockage
const api = createApiClient({
  baseURL: 'your-api',
  storage: cookieStorage,
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});
\`\`\`

---

## ⚙️ Configuration Options

\`\`\`ts
// Toutes les options disponibles pour configurer le client
createApiClient({
  baseURL?: string, // URL de base pour toutes les requêtes

  // Système de stockage personnalisé
  storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  },

  // Authentification
  auth?: {
    type: 'bearer' | 'oauth2' | 'apiKey' | 'custom'; // Type de méthode
    tokenKey?: string; // Clé où le token est stocké
    apiKey?: string;
    customHeader?: string;
    customAuthValue?: string;
    oauth2?: {
      tokenUrl: string;
      clientId: string;
      clientSecret: string;
      grantType: string;
      scope?: string;
      refreshTokenKey?: string;
    };
  },

  headers?: Record<string, string>; // Headers supplémentaires pour toutes les requêtes
  onError?: (error: unknown) => void; // Gestion globale des erreurs
});
\`\`\`

---

## ❗ Error Handling

\`\`\`ts
// Exemple d’ajout d’un gestionnaire d’erreurs global
const api = createApiClient({
  auth: { type: 'bearer', tokenKey: 'access' },
  onError: (error) => {
    console.error('Custom error handler:', error); // Log d’erreur personnalisé
  },
});
\`\`\`

---

## 🧩 Integration: Kirundi Forger Example

\`\`\`ts
// Exemple d'intégration pour le projet Kirundi Forger
const api = createApiClient({
  baseURL: 'https://api.kirundi.bi',
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});

// Exemple de requête de connexion
api.post('/auth/login', {
  email: 'admin@kirundi.bi',
  password: 'admin123',
}).then((res) => {
  // Enregistrement du token dans localStorage après login
  localStorage.setItem('access', res.data.token);
  console.log('Logged in:', res.data.user); // Affichage des infos utilisateur
});
\`\`\`

---

## ✅ Requirements

- Node.js \`>= 14\`
- Axios \`>= 1.7.2\`
- TypeScript *(optional, for types)*
- \`js-cookie\` *(optional, for cookie-based storage)*

---

## 🛠 Troubleshooting

| Problem                   | Solution                                                  |
|--------------------------|-----------------------------------------------------------|
| \`Module Not Found\`       | Ensure the package is installed and includes \`index.js\`   |
| \`401 Unauthorized\`       | Check token storage and backend token validation          |
| OAuth2 token not working | Verify \`tokenUrl\` using Postman or a cURL request         |
| Axios errors             | Confirm compatibility with \`axios@^1.7.2\`                 |

---

## 🤝 Contributing

Pull requests and issues are welcome on [GitHub](https://github.com/janeirohurley/full-axios-client)!

---

## 📄 License

MIT — © [Janeiro Hurley](https://www.npmjs.com/~janeirohurley)