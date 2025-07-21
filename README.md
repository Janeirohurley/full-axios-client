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

```bash
# npm
npm install @janeirohurley/full-axios-client

# yarn
yarn add @janeirohurley/full-axios-client

# pnpm
pnpm add @janeirohurley/full-axios-client
```

---

## 🚀 Usage

### ➤ Basic (Bearer Token with `localStorage`)

```ts
import { createApiClient } from '@janeirohurley/full-axios-client';

const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});

api.get('/words').then(console.log).catch(console.error);
```

---

### ➤ OAuth2 (Client Credentials)

```ts
const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'oauth2',
    tokenKey: 'access_token',
    oauth2: {
      tokenUrl: 'https://auth-server.com/oauth/token',
      clientId: 'your-client-id',
      clientSecret: 'your-client-secret',
      grantType: 'client_credentials',
      scope: 'api:read api:write',
    },
  },
});
```

---

### ➤ API Key Authentication

```ts
const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'apiKey',
    apiKey: 'your-api-key',
    customHeader: 'X-API-Key',
  },
});
```

---

### ➤ Custom Authentication Header

```ts
const api = createApiClient({
  baseURL: 'your-api',
  auth: {
    type: 'custom',
    customHeader: 'X-Custom-Auth',
    customAuthValue: 'your-custom-value',
  },
});
```

---

### ➤ Custom Storage (sessionStorage)

```ts
const sessionStorageImpl = {
  getItem: (key: string) => sessionStorage.getItem(key),
  setItem: (key: string, value: string) => sessionStorage.setItem(key, value),
  removeItem: (key: string) => sessionStorage.removeItem(key),
};

const api = createApiClient({
  baseURL: 'your-api',
  storage: sessionStorageImpl,
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});
```

---

### ➤ Cookie Storage (with `js-cookie`)

```bash
npm install js-cookie
```

```ts
import Cookies from 'js-cookie';

const cookieStorage = {
  getItem: (key: string) => Cookies.get(key) || null,
  setItem: (key: string, value: string) => Cookies.set(key, value, { expires: 7 }),
  removeItem: (key: string) => Cookies.remove(key),
};

const api = createApiClient({
  baseURL: 'your-api',
  storage: cookieStorage,
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});
```

---

## ⚙️ Configuration Options

```ts
createApiClient({
  baseURL?: string,
  storage?: {
    getItem: (key: string) => string | null;
    setItem: (key: string, value: string) => void;
    removeItem: (key: string) => void;
  },
  auth?: {
    type: 'bearer' | 'oauth2' | 'apiKey' | 'custom';
    tokenKey?: string;
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
  headers?: Record<string, string>;
  onError?: (error: unknown) => void;
});
```

---

## ❗ Error Handling

The client handles `401 Unauthorized` automatically for OAuth2 by refreshing the token (if a refresh token is provided).

You can provide a custom error handler:

```ts
const api = createApiClient({
  auth: { type: 'bearer', tokenKey: 'access' },
  onError: (error) => {
    console.error('Custom error handler:', error);
  },
});
```

---

## 🧩 Integration: Kirundi Forger Example

```ts
const api = createApiClient({
  baseURL: 'https://api.kirundi.bi',
  auth: {
    type: 'bearer',
    tokenKey: 'access',
  },
});

// Example login
api.post('/auth/login', {
  email: 'admin@kirundi.bi',
  password: 'admin123',
}).then((res) => {
  localStorage.setItem('access', res.data.token);
  console.log('Logged in:', res.data.user);
});
```

---

## ✅ Requirements

- Node.js `>= 14`
- Axios `>= 1.7.2`
- TypeScript *(optional, for types)*
- `js-cookie` *(optional, for cookie-based storage)*

---

## 🛠 Troubleshooting

| Problem                   | Solution                                                  |
|--------------------------|-----------------------------------------------------------|
| `Module Not Found`       | Ensure the package is installed and includes `index.js`   |
| `401 Unauthorized`       | Check token storage and backend token validation          |
| OAuth2 token not working | Verify `tokenUrl` using Postman or a cURL request         |
| Axios errors             | Confirm compatibility with `axios@^1.7.2`                 |

---

## 🤝 Contributing

Pull requests and issues are welcome on [GitHub](https://github.com/janeirohurley/full-axios-client)!

---

## 📄 License

MIT — © [Janeiro Hurley](https://www.npmjs.com/~janeirohurley)