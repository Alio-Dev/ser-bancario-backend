# Exemplos de Conexão à Base de Dados Supabase

**Servidor**: `https://hmhscxwpzuqqwklytjqp.supabase.co`
**Base de Dados**: `serbanca_prod`
**Tipo**: PostgreSQL (Supabase)

---

## 1. JavaScript/TypeScript com Supabase Client

### Instalação:
```bash
npm install @supabase/supabase-js
```

### Configuração:
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hmhscxwpzuqqwklytjqp.supabase.co';
const supabaseKey = 'sua_chave_anon_aqui';
const supabase = createClient(supabaseUrl, supabaseKey);
```

### Exemplos de Uso:

#### Listar Todos os Artigos
```javascript
const { data, error } = await supabase
  .from('articles')
  .select('*');

if (error) console.error('Erro:', error);
else console.log('Artigos:', data);
```

#### Artigos Publicados com Filtro
```javascript
const { data, error } = await supabase
  .from('articles')
  .select('id, title, excerpt, created_at')
  .eq('status', 'published')
  .order('created_at', { ascending: false })
  .limit(10);
```

#### Procurar Artigo por Slug
```javascript
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('slug', 'meu-artigo')
  .single();
```

#### Inserir Novo Artigo
```javascript
const { data, error } = await supabase
  .from('articles')
  .insert({
    title: 'Novo Artigo',
    slug: 'novo-artigo',
    content: 'Conteúdo completo aqui...',
    excerpt: 'Resumo do artigo',
    status: 'draft',
    author_id: 'id-do-autor'
  })
  .select();
```

#### Atualizar Artigo
```javascript
const { data, error } = await supabase
  .from('articles')
  .update({
    title: 'Título Atualizado',
    status: 'published'
  })
  .eq('id', 'id-do-artigo')
  .select();
```

#### Apagar Artigo
```javascript
const { error } = await supabase
  .from('articles')
  .delete()
  .eq('id', 'id-do-artigo');
```

#### Eventos Próximos (com data futura)
```javascript
const { data, error } = await supabase
  .from('events')
  .select('*')
  .gte('event_date', new Date().toISOString())
  .eq('status', 'upcoming')
  .order('event_date', { ascending: true });
```

#### Join com Múltiplas Tabelas
```javascript
// Artigos com informações do autor
const { data, error } = await supabase
  .from('articles')
  .select(`
    *,
    author:users!author_id (
      id,
      username,
      email
    )
  `)
  .eq('status', 'published');
```

#### Contagem de Registos
```javascript
const { count, error } = await supabase
  .from('articles')
  .select('*', { count: 'exact', head: true })
  .eq('status', 'published');

console.log('Total de artigos publicados:', count);
```

#### Paginação
```javascript
const page = 1;
const itemsPerPage = 10;
const from = (page - 1) * itemsPerPage;
const to = from + itemsPerPage - 1;

const { data, error, count } = await supabase
  .from('articles')
  .select('*', { count: 'exact' })
  .range(from, to);
```

---

## 2. React/Next.js Completo

### Componente de Lista de Artigos:
```jsx
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hmhscxwpzuqqwklytjqp.supabase.co',
  'sua_chave_anon_aqui'
);

export default function ArticlesList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  async function fetchArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro:', error);
    } else {
      setArticles(data);
    }
    setLoading(false);
  }

  if (loading) return <div>A carregar...</div>;

  return (
    <div>
      {articles.map(article => (
        <div key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.excerpt}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 3. Python com supabase-py

### Instalação:
```bash
pip install supabase
```

### Configuração:
```python
from supabase import create_client, Client

url: str = "https://hmhscxwpzuqqwklytjqp.supabase.co"
key: str = "sua_chave_anon_aqui"
supabase: Client = create_client(url, key)
```

### Exemplos:

#### Listar Artigos
```python
response = supabase.table('articles').select('*').execute()
articles = response.data
```

#### Filtrar por Status
```python
response = supabase.table('articles')\
    .select('*')\
    .eq('status', 'published')\
    .execute()
```

#### Inserir Artigo
```python
data = {
    'title': 'Novo Artigo',
    'slug': 'novo-artigo',
    'content': 'Conteúdo...',
    'status': 'draft'
}
response = supabase.table('articles').insert(data).execute()
```

#### Atualizar Artigo
```python
response = supabase.table('articles')\
    .update({'status': 'published'})\
    .eq('id', 'id-do-artigo')\
    .execute()
```

#### Apagar Artigo
```python
response = supabase.table('articles')\
    .delete()\
    .eq('id', 'id-do-artigo')\
    .execute()
```

---

## 4. PHP com supabase-php

### Instalação:
```bash
composer require supabase/supabase-php
```

### Configuração:
```php
<?php
require 'vendor/autoload.php';

use Supabase\SupabaseClient;

$supabase = new SupabaseClient(
    'https://hmhscxwpzuqqwklytjqp.supabase.co',
    'sua_chave_anon_aqui'
);
```

### Exemplos:

#### Listar Artigos
```php
$response = $supabase
    ->from('articles')
    ->select('*')
    ->execute();

$articles = $response->data;
```

#### Inserir Artigo
```php
$response = $supabase
    ->from('articles')
    ->insert([
        'title' => 'Novo Artigo',
        'slug' => 'novo-artigo',
        'content' => 'Conteúdo...',
        'status' => 'draft'
    ])
    ->execute();
```

---

## 5. Conexão Direta PostgreSQL

### Node.js (pg):

```bash
npm install pg
```

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.hmhscxwpzuqqwklytjqp.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'SUA_PASSWORD_AQUI',
  ssl: {
    rejectUnauthorized: false
  }
});

// Consultar
async function getArticles() {
  const result = await pool.query(
    'SELECT * FROM articles WHERE status = $1 ORDER BY created_at DESC',
    ['published']
  );
  return result.rows;
}

// Inserir
async function createArticle(title, slug, content) {
  const result = await pool.query(
    'INSERT INTO articles (title, slug, content, status) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, slug, content, 'draft']
  );
  return result.rows[0];
}
```

### Python (psycopg2):

```bash
pip install psycopg2-binary
```

```python
import psycopg2
from psycopg2.extras import RealDictCursor

conn = psycopg2.connect(
    host="db.hmhscxwpzuqqwklytjqp.supabase.co",
    port=5432,
    database="postgres",
    user="postgres",
    password="SUA_PASSWORD_AQUI",
    sslmode="require"
)

# Consultar
cursor = conn.cursor(cursor_factory=RealDictCursor)
cursor.execute("SELECT * FROM articles WHERE status = %s", ['published'])
articles = cursor.fetchall()

# Inserir
cursor.execute(
    "INSERT INTO articles (title, slug, content, status) VALUES (%s, %s, %s, %s) RETURNING *",
    ['Novo Artigo', 'novo-artigo', 'Conteúdo...', 'draft']
)
new_article = cursor.fetchone()
conn.commit()
```

### PHP (PDO):

```php
<?php
$host = 'db.hmhscxwpzuqqwklytjqp.supabase.co';
$port = '5432';
$dbname = 'postgres';
$user = 'postgres';
$password = 'SUA_PASSWORD_AQUI';

$pdo = new PDO(
    "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require",
    $user,
    $password,
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
);

// Consultar
$stmt = $pdo->prepare("SELECT * FROM articles WHERE status = :status");
$stmt->execute(['status' => 'published']);
$articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Inserir
$stmt = $pdo->prepare(
    "INSERT INTO articles (title, slug, content, status)
     VALUES (:title, :slug, :content, :status)
     RETURNING *"
);
$stmt->execute([
    'title' => 'Novo Artigo',
    'slug' => 'novo-artigo',
    'content' => 'Conteúdo...',
    'status' => 'draft'
]);
$new_article = $stmt->fetch(PDO::FETCH_ASSOC);
```

---

## 6. API REST (cURL)

### Listar Artigos:
```bash
curl -X GET 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?select=*' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui"
```

### Artigos Publicados:
```bash
curl -X GET 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?status=eq.published&select=*' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui"
```

### Inserir Artigo:
```bash
curl -X POST 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{
    "title": "Novo Artigo",
    "slug": "novo-artigo",
    "content": "Conteúdo completo aqui...",
    "status": "draft"
  }'
```

### Atualizar Artigo:
```bash
curl -X PATCH 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?id=eq.ID_DO_ARTIGO' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"status": "published"}'
```

### Apagar Artigo:
```bash
curl -X DELETE 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?id=eq.ID_DO_ARTIGO' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui"
```

---

## 7. Filtros e Operadores Avançados

### Operadores de Comparação:
```javascript
// Igual
.eq('status', 'published')

// Diferente
.neq('status', 'archived')

// Maior que
.gt('created_at', '2024-01-01')

// Maior ou igual
.gte('created_at', '2024-01-01')

// Menor que
.lt('created_at', '2024-12-31')

// Menor ou igual
.lte('created_at', '2024-12-31')

// LIKE (contém)
.like('title', '%palavra%')

// ILIKE (contém, case-insensitive)
.ilike('title', '%palavra%')

// IN (dentro de lista)
.in('status', ['published', 'draft'])

// IS NULL
.is('featured_image', null)

// NOT NULL
.not('featured_image', 'is', null)
```

### Múltiplos Filtros (AND):
```javascript
const { data } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published')
  .gte('created_at', '2024-01-01')
  .ilike('title', '%tecnologia%');
```

### Filtros OR:
```javascript
const { data } = await supabase
  .from('articles')
  .select('*')
  .or('status.eq.published,status.eq.draft');
```

### Ordenação:
```javascript
// Ascendente
.order('created_at', { ascending: true })

// Descendente
.order('created_at', { ascending: false })

// Múltiplas colunas
.order('status', { ascending: true })
.order('created_at', { ascending: false })
```

### Limitação e Paginação:
```javascript
// Primeiros 10 registos
.limit(10)

// Paginação
.range(0, 9)   // Página 1 (0-9)
.range(10, 19) // Página 2 (10-19)
```

---

## 8. Realtime (Tempo Real)

### Subscrever a Mudanças:
```javascript
const channel = supabase
  .channel('articles-changes')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'articles'
    },
    (payload) => {
      console.log('Mudança detectada:', payload);
    }
  )
  .subscribe();

// Eventos específicos:
// event: 'INSERT'  - Apenas inserções
// event: 'UPDATE'  - Apenas atualizações
// event: 'DELETE'  - Apenas eliminações
// event: '*'       - Todos os eventos
```

---

## 9. Storage (Ficheiros)

### Upload de Ficheiro:
```javascript
const file = event.target.files[0];

const { data, error } = await supabase.storage
  .from('images')
  .upload(`public/${file.name}`, file);
```

### URL Público:
```javascript
const { data } = supabase.storage
  .from('images')
  .getPublicUrl('public/imagem.jpg');

const imageUrl = data.publicUrl;
```

### Download:
```javascript
const { data, error } = await supabase.storage
  .from('images')
  .download('public/imagem.jpg');
```

---

## 10. Transações e Batch Operations

### Inserir Múltiplos Registos:
```javascript
const { data, error } = await supabase
  .from('articles')
  .insert([
    { title: 'Artigo 1', slug: 'artigo-1', content: '...', status: 'draft' },
    { title: 'Artigo 2', slug: 'artigo-2', content: '...', status: 'draft' },
    { title: 'Artigo 3', slug: 'artigo-3', content: '...', status: 'draft' }
  ])
  .select();
```

### Upsert (Insert ou Update):
```javascript
const { data, error } = await supabase
  .from('articles')
  .upsert({
    id: 'existing-id',
    title: 'Atualizado',
    status: 'published'
  })
  .select();
```

---

## Informações Importantes

1. **Chave Anon vs Service Role**:
   - Use `anon` key no frontend (browser)
   - Use `service_role` key apenas no backend (servidor)

2. **Row Level Security (RLS)**:
   - Todas as tabelas têm RLS ativo
   - Políticas controlam quem pode ler/escrever
   - Verifique as políticas antes de fazer queries

3. **Rate Limits**:
   - Plano gratuito tem limites
   - Monitorize uso no painel Supabase

4. **Boas Práticas**:
   - Sempre valide dados antes de inserir
   - Use prepared statements (evita SQL injection)
   - Faça cache quando apropriado
   - Use `select` específico, evite `SELECT *`

---

Para mais informações: https://supabase.com/docs
