# Guia de Implementação - Serbancario Admin Dashboard

## Informações da Base de Dados

**Servidor Supabase**: `https://hmhscxwpzuqqwklytjqp.supabase.co`
**Tipo**: PostgreSQL (Supabase)
**Nome da Base de Dados**: `serbanca_prod`

---

## Parte 1: Preparar o Projeto para Download

### Passo 1: Obter as Credenciais do Supabase

1. Aceda ao painel do Supabase: https://supabase.com/dashboard
2. Selecione o seu projeto
3. Vá para **Settings** > **API**
4. Copie as seguintes informações:
   - **Project URL**: `https://hmhscxwpzuqqwklytjqp.supabase.co`
   - **anon/public key**: (chave pública - começa com "eyJ...")
   - **service_role key**: (chave secreta - apenas para backend)

### Passo 2: Atualizar o Ficheiro .env

Crie/atualize o ficheiro `.env` na raiz do projeto com:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://hmhscxwpzuqqwklytjqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui

# Database Configuration (para referência)
DATABASE_URL=postgresql://postgres:[SUA_PASSWORD]@db.hmhscxwpzuqqwklytjqp.supabase.co:5432/postgres
```

### Passo 3: Build do Projeto

Execute os seguintes comandos:

```bash
# Instalar dependências
npm install

# Build de produção
npm run build

# Testar localmente (opcional)
npm start
```

---

## Parte 2: Implementação no cPanel

### Opção A: Implementação com Node.js (Recomendado)

#### Passo 1: Verificar Suporte Node.js no cPanel

1. Faça login no cPanel
2. Procure por "**Setup Node.js App**" ou "**Node.js Selector**"
3. Se não existir, contacte o seu fornecedor de hosting

#### Passo 2: Criar Aplicação Node.js

1. No cPanel, aceda a "**Setup Node.js App**"
2. Clique em "**Create Application**"
3. Configure:
   - **Node.js Version**: 18.x ou superior
   - **Application Mode**: Production
   - **Application Root**: `/home/seuusuario/serbancario-admin`
   - **Application URL**: `admin.seudominio.com` ou `/admin`
   - **Application Startup File**: `server.js`

#### Passo 3: Carregar os Ficheiros

**Via File Manager do cPanel:**
1. Aceda a "**File Manager**"
2. Navegue até ao diretório da aplicação
3. Carregue TODOS os ficheiros do projeto:
   - `.next/` (pasta gerada pelo build)
   - `node_modules/` (ou instale via terminal)
   - `public/`
   - `package.json`
   - `next.config.js`
   - `.env`
   - Todos os outros ficheiros

**Via FTP/SFTP (Alternativa):**
1. Use FileZilla ou outro cliente FTP
2. Conecte ao seu servidor
3. Carregue todos os ficheiros do projeto

#### Passo 4: Instalar Dependências no Servidor

1. No cPanel, aceda a "**Terminal**" ou use SSH
2. Navegue até ao diretório da aplicação:
```bash
cd ~/serbancario-admin
```

3. Instale as dependências:
```bash
npm install --production
```

#### Passo 5: Configurar Variáveis de Ambiente

1. No cPanel, na configuração da aplicação Node.js
2. Adicione as variáveis de ambiente:
```
NEXT_PUBLIC_SUPABASE_URL=https://hmhscxwpzuqqwklytjqp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_aqui
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
NODE_ENV=production
```

#### Passo 6: Criar server.js (Ficheiro de Arranque)

Crie o ficheiro `server.js` na raiz:

```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
```

#### Passo 7: Iniciar a Aplicação

1. No cPanel, na secção "**Setup Node.js App**"
2. Encontre a sua aplicação
3. Clique em "**Start**" ou "**Restart**"

---

### Opção B: Implementação Estática (Se Node.js não estiver disponível)

#### Passo 1: Gerar Exportação Estática

Atualize `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
```

Execute:
```bash
npm run build
```

**NOTA**: Esta opção NÃO funcionará para as funcionalidades que requerem API routes (redefinição de senha, etc.)

---

## Parte 3: Configuração do Supabase

### Passo 1: Configurar CORS

1. No painel do Supabase, vá para **Authentication** > **URL Configuration**
2. Adicione o seu domínio em "**Site URL**":
   - `https://seudominio.com`
   - `https://admin.seudominio.com`

3. Em "**Redirect URLs**", adicione:
   - `https://seudominio.com/dashboard`
   - `https://admin.seudominio.com/dashboard`

### Passo 2: Configurar RLS (Row Level Security)

As políticas RLS já estão configuradas nas migrações. Verifique se foram aplicadas:

1. No painel Supabase, vá para **Database** > **Tables**
2. Verifique se todas as tabelas existem:
   - `users`
   - `articles`
   - `events`
   - `sponsors`
   - `categories`
   - `tags`
   - `activity_logs`
   - `password_reset_tokens`

3. Para cada tabela, verifique se RLS está ativo (ícone de cadeado verde)

### Passo 3: Criar Utilizador Super-Admin Inicial

Execute no SQL Editor do Supabase:

```sql
-- Criar primeiro Super-Administrador
INSERT INTO users (username, email, password_hash, role)
VALUES (
  'admin',
  'admin@serbancario.ao',
  '$2a$10$placeholder_hash_substitua_isto',  -- Substitua por hash real
  'super-admin'
);
```

Para gerar o hash da senha, use este script Node.js:

```javascript
const bcrypt = require('bcrypt');
const senha = 'SuaSenhaSegura123';
bcrypt.hash(senha, 10, (err, hash) => {
  console.log('Hash:', hash);
});
```

Ou online: https://bcrypt-generator.com/

---

## Parte 4: Conectar Outras Aplicações à Base de Dados

### Opção 1: Usar Supabase Client (Recomendado)

#### Para Aplicações JavaScript/TypeScript:

```bash
npm install @supabase/supabase-js
```

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hmhscxwpzuqqwklytjqp.supabase.co',
  'sua_chave_anon_aqui'
);

// Ler dados
const { data, error } = await supabase
  .from('articles')
  .select('*')
  .eq('status', 'published');

// Inserir dados
const { data, error } = await supabase
  .from('articles')
  .insert({ title: 'Novo Artigo', content: '...' });
```

#### Para Aplicações Python:

```bash
pip install supabase
```

```python
from supabase import create_client

supabase = create_client(
    "https://hmhscxwpzuqqwklytjqp.supabase.co",
    "sua_chave_anon_aqui"
)

# Ler dados
response = supabase.table('articles').select('*').eq('status', 'published').execute()

# Inserir dados
response = supabase.table('articles').insert({
    'title': 'Novo Artigo',
    'content': '...'
}).execute()
```

#### Para Aplicações PHP:

```bash
composer require supabase/supabase-php
```

```php
<?php
require 'vendor/autoload.php';

use Supabase\SupabaseClient;

$supabase = new SupabaseClient(
    'https://hmhscxwpzuqqwklytjqp.supabase.co',
    'sua_chave_anon_aqui'
);

// Ler dados
$response = $supabase
    ->from('articles')
    ->select('*')
    ->eq('status', 'published')
    ->execute();

// Inserir dados
$response = $supabase
    ->from('articles')
    ->insert([
        'title' => 'Novo Artigo',
        'content' => '...'
    ])
    ->execute();
```

### Opção 2: Conexão Direta PostgreSQL

#### String de Conexão:

```
postgresql://postgres:[SUA_PASSWORD]@db.hmhscxwpzuqqwklytjqp.supabase.co:5432/postgres
```

Para obter a password:
1. Painel Supabase > **Settings** > **Database**
2. Copie a "**Connection string**" completa

#### Para Node.js (pg):

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
  password: 'sua_password_aqui',
  ssl: { rejectUnauthorized: false }
});

// Consultar
const result = await pool.query('SELECT * FROM articles WHERE status = $1', ['published']);
```

#### Para Python (psycopg2):

```bash
pip install psycopg2-binary
```

```python
import psycopg2

conn = psycopg2.connect(
    host="db.hmhscxwpzuqqwklytjqp.supabase.co",
    port=5432,
    database="postgres",
    user="postgres",
    password="sua_password_aqui",
    sslmode="require"
)

cursor = conn.cursor()
cursor.execute("SELECT * FROM articles WHERE status = %s", ['published'])
rows = cursor.fetchall()
```

#### Para PHP (PDO):

```php
<?php
$host = 'db.hmhscxwpzuqqwklytjqp.supabase.co';
$port = '5432';
$dbname = 'postgres';
$user = 'postgres';
$password = 'sua_password_aqui';

try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require",
        $user,
        $password
    );

    // Consultar
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE status = :status");
    $stmt->execute(['status' => 'published']);
    $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    die("Erro: " . $e->getMessage());
}
```

### Opção 3: API REST do Supabase

Todas as tabelas estão automaticamente disponíveis via REST API:

```bash
# GET - Ler dados
curl 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?select=*' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui"

# POST - Inserir dados
curl -X POST 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui" \
  -H "Content-Type: application/json" \
  -d '{"title":"Novo Artigo","content":"..."}'

# PATCH - Atualizar dados
curl -X PATCH 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?id=eq.123' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui" \
  -H "Content-Type: application/json" \
  -d '{"title":"Título Atualizado"}'

# DELETE - Apagar dados
curl -X DELETE 'https://hmhscxwpzuqqwklytjqp.supabase.co/rest/v1/articles?id=eq.123' \
  -H "apikey: sua_chave_anon_aqui" \
  -H "Authorization: Bearer sua_chave_anon_aqui"
```

---

## Parte 5: Segurança e Boas Práticas

### 1. Proteger Credenciais

- **NUNCA** partilhe a `service_role` key publicamente
- Use apenas `anon` key no frontend
- Guarde `service_role` key apenas no backend/servidor

### 2. Configurar HTTPS

- Certifique-se que o seu domínio usa HTTPS
- No cPanel, instale certificado SSL (Let's Encrypt é gratuito)

### 3. Configurar Firewall

No painel Supabase:
1. Vá para **Settings** > **Database** > **Network Restrictions**
2. Adicione apenas IPs permitidos (opcional, mas recomendado)

### 4. Backups Regulares

1. Supabase faz backups automáticos
2. Configure backups adicionais se necessário
3. Exporte dados regularmente via:
```bash
pg_dump -h db.hmhscxwpzuqqwklytjqp.supabase.co -U postgres -d postgres > backup.sql
```

### 5. Monitorização

1. Painel Supabase > **Reports** para ver uso
2. Configure alertas para uso elevado
3. Monitore logs de atividade regularmente

---

## Parte 6: Resolução de Problemas

### Erro: "Failed to connect to database"

**Solução:**
1. Verifique se as credenciais em `.env` estão corretas
2. Confirme que o URL do Supabase está acessível
3. Verifique se RLS está configurado corretamente

### Erro: "Application failed to start"

**Solução:**
1. Verifique logs no cPanel
2. Confirme que `server.js` existe
3. Verifique se a porta está correta
4. Execute `npm install` novamente

### Erro: "CORS policy error"

**Solução:**
1. No Supabase, adicione o domínio em URL Configuration
2. Verifique se HTTPS está ativo
3. Limpe cache do navegador

### Aplicação lenta

**Solução:**
1. Verifique plano do Supabase (free tier tem limites)
2. Adicione índices às tabelas mais consultadas
3. Use caching quando apropriado
4. Otimize queries (use `select` específico, não `*`)

---

## Parte 7: Estrutura das Tabelas

### Tabelas Principais:

1. **users** - Utilizadores do sistema
   - `id` (UUID)
   - `username` (TEXT)
   - `email` (TEXT)
   - `password_hash` (TEXT)
   - `role` (TEXT): super-admin, admin, manager, support
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **articles** - Artigos/Posts
   - `id` (UUID)
   - `title` (TEXT)
   - `slug` (TEXT)
   - `content` (TEXT)
   - `excerpt` (TEXT)
   - `featured_image` (TEXT)
   - `status` (TEXT): draft, published, archived
   - `author_id` (UUID)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

3. **events** - Eventos
   - `id` (UUID)
   - `title` (TEXT)
   - `description` (TEXT)
   - `location` (TEXT)
   - `event_date`, `end_date` (TIMESTAMPTZ)
   - `image_url` (TEXT)
   - `status` (TEXT): upcoming, ongoing, completed, cancelled
   - `created_at`, `updated_at` (TIMESTAMPTZ)

4. **sponsors** - Patrocinadores
   - `id` (UUID)
   - `name` (TEXT)
   - `logo_url` (TEXT)
   - `website` (TEXT)
   - `description` (TEXT)
   - `tier` (TEXT): platinum, gold, silver, bronze
   - `active` (BOOLEAN)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

5. **categories** - Categorias
   - `id` (UUID)
   - `name` (TEXT)
   - `slug` (TEXT)
   - `description` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

6. **tags** - Etiquetas
   - `id` (UUID)
   - `name` (TEXT)
   - `slug` (TEXT)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

7. **activity_logs** - Registo de Atividades
   - `id` (UUID)
   - `user_id` (UUID)
   - `action` (TEXT): INSERT, UPDATE, DELETE
   - `table_name` (TEXT)
   - `record_id` (TEXT)
   - `old_values` (JSONB)
   - `new_values` (JSONB)
   - `ip_address` (TEXT)
   - `created_at` (TIMESTAMPTZ)

8. **password_reset_tokens** - Tokens de Redefinição
   - `id` (UUID)
   - `user_id` (UUID)
   - `token` (TEXT)
   - `expires_at` (TIMESTAMPTZ)
   - `used` (BOOLEAN)
   - `created_at` (TIMESTAMPTZ)

---

## Parte 8: Exemplo de Integração Completa

### Website Público (Frontend)

```javascript
// Conectar ao Supabase
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://hmhscxwpzuqqwklytjqp.supabase.co',
  'sua_chave_anon_aqui'
);

// Listar artigos publicados
async function getPublishedArticles() {
  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, featured_image, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .limit(10);

  return data;
}

// Obter artigo específico
async function getArticleBySlug(slug) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return data;
}

// Listar eventos próximos
async function getUpcomingEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('status', 'upcoming')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });

  return data;
}

// Listar patrocinadores ativos
async function getActiveSponsors() {
  const { data, error } = await supabase
    .from('sponsors')
    .select('*')
    .eq('active', true)
    .order('tier', { ascending: true });

  return data;
}
```

---

## Contacto e Suporte

Para questões técnicas:
- Documentação Supabase: https://supabase.com/docs
- Documentação Next.js: https://nextjs.org/docs
- Stack Overflow: https://stackoverflow.com/

Para problemas com cPanel, contacte o suporte do seu fornecedor de hosting.

---

## Checklist de Implementação

- [ ] Credenciais do Supabase obtidas
- [ ] Ficheiro .env configurado
- [ ] Projeto testado localmente
- [ ] Build de produção gerado
- [ ] Ficheiros carregados para cPanel
- [ ] Node.js App configurada no cPanel
- [ ] Dependências instaladas no servidor
- [ ] server.js criado e configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Aplicação iniciada com sucesso
- [ ] CORS configurado no Supabase
- [ ] Certificado SSL instalado
- [ ] Primeiro utilizador Super-Admin criado
- [ ] Aplicação acessível via browser
- [ ] Password reset testado
- [ ] Todas as funcionalidades verificadas

---

**BOA SORTE COM A SUA IMPLEMENTAÇÃO!**
