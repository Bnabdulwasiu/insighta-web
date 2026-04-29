# Insighta Web Portal

Web interface for the Insighta Labs+ platform.

## Live URL
https://insighta-web-psi-neon.vercel.app

---

## Pages

| Page | File | Description |
|---|---|---|
| Login | `index.html` | GitHub OAuth entry point |
| Dashboard | `dashboard.html` | Stats overview |
| Profiles | `profiles.html` | List, filter, paginate, export |
| Profile Detail | `profile-detail.html` | Single profile view |
| Search | `search.html` | Natural language search |
| Account | `account.html` | Current user info |

---

## Authentication

- Login via GitHub OAuth
- Tokens stored in **HTTP-only cookies** — inaccessible to JavaScript
- CSRF protection via `oauth_state` cookie validated on callback
- Auto-refresh on `401` — transparent to the user
- Logout revokes the refresh token server-side

---

## Local Development

```bash
git clone https://github.com/Bnabdulwasiu/insighta-web.git
cd insighta-web
npx serve .
# → http://localhost:3000
```

To point at a local backend update `API_URL` in `static/js/api.js`:
```javascript
const API_URL = 'http://localhost:8000';
```

---

## Project Structure

insighta-web/
├── index.html
├── dashboard.html
├── profiles.html
├── profile-detail.html
├── search.html
├── account.html
└── static/
├── css/
│   └── styles.css
└── js/
├── api.js             # fetch wrapper, auto-refresh, requireAuth
├── auth.js            # login redirect, logout, attachLogout helper
├── dashboard.js
├── profiles.js
├── profile-detail.js
├── search.js
└── account.js

---

## Security

- HTTP-only cookies prevent XSS token theft
- `SameSite=None; Secure` enables cross-domain cookie sending
- CSRF protection on OAuth callback via state parameter
- All API requests go through authenticated fetch wrapper
- Unauthenticated users are redirected to login automatically