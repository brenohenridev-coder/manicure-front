# 💅 Studio Belle — Frontend

## Stack
- React 18 + Vite
- React Router v6
- Axios
- CSS customizado com variáveis (paleta de cores rosa)
- Deploy: Vercel

---

## 🚀 Deploy na Vercel (passo a passo)

### 1. Criar repositório no GitHub
```bash
cd manicure-frontend
git init
git add .
git commit -m "feat: initial frontend setup"
git remote add origin https://github.com/SEU_USUARIO/manicure-frontend.git
git push -u origin main
```

### 2. Acessar Vercel
1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em **"Add New Project"**
3. Importe o repositório `manicure-frontend`

### 3. Configurar variável de ambiente
Na tela de configuração do projeto, vá em **"Environment Variables"** e adicione:
```
VITE_API_URL = https://SUA-URL-DO-RAILWAY.railway.app
```
> ⚠️ Use a URL gerada pelo Railway no deploy do backend (sem barra no final)

### 4. Deploy
- Clique em **"Deploy"**
- A Vercel detecta automaticamente o Vite e configura o build
- Em alguns minutos seu site estará no ar!

### 5. Atualizar URL no backend
Após o deploy, copie a URL da Vercel (ex: `https://studio-belle.vercel.app`)
e atualize a variável `FRONTEND_URL` no Railway para essa URL.

---

## 💻 Rodar localmente

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env
cp .env.example .env.local
# Edite com a URL do seu backend local

# 3. Rodar
npm run dev
```

---

## 📱 Páginas

| Rota | Descrição |
|------|-----------|
| `/` | Página de agendamento para clientes |
| `/agendamento/sucesso` | Confirmação de agendamento |
| `/admin/login` | Login das profissionais |
| `/admin` | Dashboard (agendamentos do dia) |
| `/admin/agenda` | Agenda por data |
| `/admin/clientes` | Lista de clientes com busca |
| `/admin/equipe` | Gestão da equipe (só admin) |

---

## 👤 Acesso padrão (após seed do backend)
- **Admin**: admin@manicure.com / admin123
- **Profissional**: ana@manicure.com / 123456

---

## 🎨 Cores do sistema
- Rosa médio: `#F48FB1`
- Rosa claro: `#F8BBD9`
- Branco: `#FFFFFF`
- Off-white: `#F5F5F5`
