# Guia de Integração Frontend (Vite + React) e Backend (Node.js + Express)

## Informações de Conexão

**Servidor Supabase**: `https://hmhscxwpzuqqwklytjqp.supabase.co`
**Base de Dados**: `serbanca_prod`
**Tipo**: PostgreSQL (Supabase)

**Chave Anon (Frontend)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaHNjeHdwenVxcXdrbHl0anFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Mjk5NDgsImV4cCI6MjA3NjIwNTk0OH0.S7pkXevns137lyKtylsaew-m9pyHVPGLK_5QYLq5fD0
```

**Chave Service Role (Backend)**:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaHNjeHdwenVxcXdrbHl0anFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYyOTk0OCwiZXhwIjoyMDc2MjA1OTQ4fQ.xZ9kYGqVRKD5FqLRgc7X5tV8eLjU5wJ6YmxXTKqH0eU
```

---

# PARTE 1: Frontend (Vite + React)

## 1. Configuração do Projeto Vite React

### Passo 1: Instalar Dependências

```bash
npm install @supabase/supabase-js
```

### Passo 2: Criar Ficheiro .env

Crie `.env` na raiz do projeto Vite:

```env
# Frontend Vite React - Supabase Configuration
VITE_SUPABASE_URL=https://hmhscxwpzuqqwklytjqp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaHNjeHdwenVxcXdrbHl0anFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2Mjk5NDgsImV4cCI6MjA3NjIwNTk0OH0.S7pkXevns137lyKtylsaew-m9pyHVPGLK_5QYLq5fD0
```

**IMPORTANTE**: No Vite, as variáveis de ambiente devem começar com `VITE_`

### Passo 3: Configurar Cliente Supabase

Crie `src/lib/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

## 2. Exemplos de Uso no Frontend React

### Exemplo 1: Hook Customizado para Artigos

Crie `src/hooks/useArticles.js`:

```javascript
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data);
    } catch (error) {
      setError(error.message);
      console.error('Erro ao carregar artigos:', error);
    } finally {
      setLoading(false);
    }
  }

  return { articles, loading, error, refetch: fetchArticles };
}
```

### Exemplo 2: Componente de Lista de Artigos

Crie `src/components/ArticleList.jsx`:

```javascript
import React from 'react';
import { useArticles } from '../hooks/useArticles';

export default function ArticleList() {
  const { articles, loading, error } = useArticles();

  if (loading) {
    return <div className="loading">A carregar artigos...</div>;
  }

  if (error) {
    return <div className="error">Erro: {error}</div>;
  }

  return (
    <div className="article-list">
      <h1>Artigos</h1>
      <div className="articles-grid">
        {articles.map((article) => (
          <div key={article.id} className="article-card">
            {article.featured_image && (
              <img src={article.featured_image} alt={article.title} />
            )}
            <h2>{article.title}</h2>
            <p>{article.excerpt}</p>
            <a href={`/artigos/${article.slug}`}>Ler mais</a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Exemplo 3: Componente de Detalhes do Artigo

Crie `src/components/ArticleDetail.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
  }, [slug]);

  async function fetchArticle() {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      setArticle(data);
    } catch (error) {
      console.error('Erro ao carregar artigo:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>A carregar...</div>;
  if (!article) return <div>Artigo não encontrado</div>;

  return (
    <article>
      <h1>{article.title}</h1>
      {article.featured_image && (
        <img src={article.featured_image} alt={article.title} />
      )}
      <div dangerouslySetInnerHTML={{ __html: article.content }} />
      <p className="date">
        Publicado em: {new Date(article.created_at).toLocaleDateString('pt-PT')}
      </p>
    </article>
  );
}
```

### Exemplo 4: Listar Eventos Próximos

Crie `src/components/EventsList.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function EventsList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents();
  }, []);

  async function fetchUpcomingEvents() {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'upcoming')
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data);
    } catch (error) {
      console.error('Erro ao carregar eventos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>A carregar eventos...</div>;

  return (
    <div className="events-list">
      <h2>Próximos Eventos</h2>
      {events.length === 0 ? (
        <p>Não há eventos agendados.</p>
      ) : (
        <div className="events-grid">
          {events.map((event) => (
            <div key={event.id} className="event-card">
              {event.image_url && (
                <img src={event.image_url} alt={event.title} />
              )}
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p className="location">📍 {event.location}</p>
              <p className="date">
                📅 {new Date(event.event_date).toLocaleDateString('pt-PT')}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Exemplo 5: Listar Patrocinadores

Crie `src/components/SponsorsList.jsx`:

```javascript
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SponsorsList() {
  const [sponsors, setSponsors] = useState([]);

  useEffect(() => {
    fetchSponsors();
  }, []);

  async function fetchSponsors() {
    const { data } = await supabase
      .from('sponsors')
      .select('*')
      .eq('active', true)
      .order('tier', { ascending: true });

    setSponsors(data || []);
  }

  const tierNames = {
    platinum: 'Platina',
    gold: 'Ouro',
    silver: 'Prata',
    bronze: 'Bronze'
  };

  return (
    <div className="sponsors">
      <h2>Nossos Patrocinadores</h2>
      {Object.keys(tierNames).map((tier) => {
        const tierSponsors = sponsors.filter((s) => s.tier === tier);
        if (tierSponsors.length === 0) return null;

        return (
          <div key={tier} className={`tier tier-${tier}`}>
            <h3>{tierNames[tier]}</h3>
            <div className="sponsors-grid">
              {tierSponsors.map((sponsor) => (
                <a
                  key={sponsor.id}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="sponsor-card"
                >
                  <img src={sponsor.logo_url} alt={sponsor.name} />
                  <p>{sponsor.name}</p>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Exemplo 6: Context API para Estado Global

Crie `src/contexts/DataContext.jsx`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [articles, setArticles] = useState([]);
  const [events, setEvents] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      const [articlesData, eventsData, sponsorsData] = await Promise.all([
        supabase.from('articles').select('*').eq('status', 'published'),
        supabase.from('events').select('*').eq('status', 'upcoming'),
        supabase.from('sponsors').select('*').eq('active', true)
      ]);

      setArticles(articlesData.data || []);
      setEvents(eventsData.data || []);
      setSponsors(sponsorsData.data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DataContext.Provider value={{ articles, events, sponsors, loading, refetch: loadAllData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
```

Use no `src/main.jsx`:

```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './contexts/DataContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </React.StrictMode>
);
```

---

# PARTE 2: Backend (Node.js + Express)

## 1. Configuração do Projeto Express

### Passo 1: Criar Projeto

```bash
mkdir backend-serbancario
cd backend-serbancario
npm init -y
```

### Passo 2: Instalar Dependências

```bash
npm install express @supabase/supabase-js dotenv cors
npm install --save-dev nodemon
```

### Passo 3: Criar Ficheiro .env

```env
# Backend Node.js/Express - Supabase Configuration
SUPABASE_URL=https://hmhscxwpzuqqwklytjqp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaHNjeHdwenVxcXdrbHl0anFwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDYyOTk0OCwiZXhwIjoyMDc2MjA1OTQ4fQ.xZ9kYGqVRKD5FqLRgc7X5tV8eLjU5wJ6YmxXTKqH0eU

PORT=5000
NODE_ENV=development
```

### Passo 4: Atualizar package.json

```json
{
  "name": "backend-serbancario",
  "version": "1.0.0",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

## 2. Estrutura do Projeto Backend

```
backend-serbancario/
├── server.js
├── .env
├── config/
│   └── supabase.js
├── routes/
│   ├── articles.js
│   ├── events.js
│   └── sponsors.js
└── middleware/
    └── errorHandler.js
```

## 3. Configurar Cliente Supabase

Crie `config/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
```

## 4. Criar Servidor Express

Crie `server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import articlesRouter from './routes/articles.js';
import eventsRouter from './routes/events.js';
import sponsorsRouter from './routes/sponsors.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://seudominio.com'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/articles', articlesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/sponsors', sponsorsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
```

## 5. Criar Routes

### Articles Route

Crie `routes/articles.js`:

```javascript
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/articles - Listar todos os artigos publicados
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/articles/:slug - Obter artigo por slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .eq('status', 'published')
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Artigo não encontrado' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/articles/category/:category - Filtrar por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .ilike('category', `%${category}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/articles/search - Pesquisar artigos
router.post('/search', async (req, res) => {
  try {
    const { query } = req.body;
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### Events Route

Crie `routes/events.js`:

```javascript
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/events - Listar eventos próximos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'upcoming')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/past - Eventos passados
router.get('/past', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'completed')
      .order('event_date', { ascending: false })
      .limit(10);

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/events/:id - Obter evento específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ success: false, error: 'Evento não encontrado' });
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

### Sponsors Route

Crie `routes/sponsors.js`:

```javascript
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/sponsors - Listar patrocinadores ativos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('sponsors')
      .select('*')
      .eq('active', true)
      .order('tier', { ascending: true });

    if (error) throw error;

    // Agrupar por tier
    const grouped = {
      platinum: [],
      gold: [],
      silver: [],
      bronze: []
    };

    data.forEach(sponsor => {
      if (grouped[sponsor.tier]) {
        grouped[sponsor.tier].push(sponsor);
      }
    });

    res.json({ success: true, data: grouped });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
```

## 6. Usar API no Frontend Vite

Crie `src/services/api.js`:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export async function getArticles() {
  const response = await fetch(`${API_URL}/articles`);
  const json = await response.json();
  return json.data;
}

export async function getArticleBySlug(slug) {
  const response = await fetch(`${API_URL}/articles/${slug}`);
  const json = await response.json();
  return json.data;
}

export async function getEvents() {
  const response = await fetch(`${API_URL}/events`);
  const json = await response.json();
  return json.data;
}

export async function getSponsors() {
  const response = await fetch(`${API_URL}/sponsors`);
  const json = await response.json();
  return json.data;
}

export async function searchArticles(query) {
  const response = await fetch(`${API_URL}/articles/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const json = await response.json();
  return json.data;
}
```

Adicione ao `.env` do Vite:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# PARTE 3: Decisão Frontend vs Backend

## Quando usar Supabase diretamente no Frontend?

✅ **Use no Frontend quando:**
- Precisa apenas ler dados públicos
- Quer tempo real (Realtime subscriptions)
- Reduzir latência
- Cache no browser

## Quando usar Backend (Express)?

✅ **Use Backend quando:**
- Precisa lógica de negócio complexa
- Processar dados antes de enviar
- Integrar com serviços externos
- Autenticação customizada
- Rate limiting
- Cache do lado do servidor

## Abordagem Híbrida (Recomendado)

- **Frontend**: Leitura de dados públicos direto do Supabase
- **Backend**: Operações sensíveis, lógica complexa, integrações

---

# PARTE 4: Deploy

## Frontend Vite

```bash
npm run build
# Deploy pasta dist/ para Vercel, Netlify, ou cPanel
```

## Backend Express

```bash
# No servidor
npm install --production
npm start
# Ou use PM2:
pm2 start server.js --name "serbancario-api"
```

---

# Resumo das Credenciais

| Aplicação | URL | Chave |
|-----------|-----|-------|
| **Frontend Vite** | `https://hmhscxwpzuqqwklytjqp.supabase.co` | `VITE_SUPABASE_ANON_KEY` |
| **Backend Express** | `https://hmhscxwpzuqqwklytjqp.supabase.co` | `SUPABASE_SERVICE_ROLE_KEY` |
| **PostgreSQL Direto** | `db.hmhscxwpzuqqwklytjqp.supabase.co:5432` | Password do Supabase |

**🔒 SEGURANÇA**: NUNCA exponha a `SERVICE_ROLE_KEY` no frontend!
