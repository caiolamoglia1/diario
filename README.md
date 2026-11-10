# 📔 Nosso Diário

Um diário compartilhado para duas pessoas: um diário de capa de couro em cima de uma mesa de madeira, que abre e vira as páginas em 3D.
Feito com React + Vite, Supabase (login, banco e tempo real) e componentes do [React Bits](https://reactbits.dev).

## Rodar

```bash
npm install
npm run dev
```

Abra **http://localhost:5173**. Sem configurar nada, o diário roda **só no navegador**: os dados ficam no localStorage
(começa com 3 páginas de exemplo). Para zerar, rode `localStorage.removeItem('nosso-diario:dados')` no console e recarregue.

Nesse modo os dados não são compartilhados entre computadores. Para os dois usarem de verdade, configure o Supabase abaixo:
com o `.env.local` preenchido o app passa a usar o banco automaticamente.

## Configurar o Supabase (quando quiser compartilhar)

1. Crie um projeto grátis em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor → New query**, cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**.
   Isso cria as tabelas, as regras de segurança (RLS), o limite de 2 pessoas e ativa o tempo real.
3. Em **Authentication → Users → Add user → Create new user**, crie os 2 usuários (e-mail + senha) marcando **Auto Confirm User**.
4. Em **Authentication → Sign In / Providers → Email**, desligue **Allow new users to sign up**, para ninguém mais criar conta.
5. Em **Project Settings → API Keys** (ou **Data API**), copie a **Project URL** e a chave **anon / publishable**.
6. Copie `.env.example` para `.env.local` e preencha:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=sua-chave
   ```

7. `npm run dev` e entre com um dos usuários. No primeiro acesso cada pessoa escolhe nome, bichinho e cor.

> A chave anon/publishable pode ficar no front: quem protege os dados são as regras de RLS do `schema.sql`.
> Só quem tem perfil no diário (no máximo 2 pessoas) consegue ler; cada um só edita ou apaga as próprias páginas.

### Atualizações do banco (rode em ordem, uma vez cada)

Cada arquivo pode ser rodado de novo sem problema. No SQL Editor, cole e clique em **Run**:

1. `supabase/schema.sql` — base (perfis, páginas, reações)
2. `supabase/002_bilhetes.sql` — bilhetinhos
3. `supabase/003_fotos_e_datas.sql` — fotos (pasta privada `fotos`) e "juntos há X dias"
4. `supabase/004_cantinhos.sql` — lacre seguro, cartas "abra quando", pergunta do dia, nossa lista, contagens, áudio

### Avisos com o app fechado (push) — opcional

As chaves já foram geradas em `supabase/push-segredos.local.txt` (fora do git; não compartilhe).

1. **Edge Functions → Deploy a new function → Via Editor**, nome `push`. Cole o conteúdo de
   `supabase/functions/push/index.ts` e, nas configurações da função, **desligue "Verify JWT"**.
   (Ou pela linha de comando: `npx supabase functions deploy push --project-ref wwaozoyvpsqbdpcrfwpk --no-verify-jwt`.)
2. **Edge Functions → Secrets**: cadastre `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `WEBHOOK_SECRET` com os valores do arquivo.
3. **SQL Editor**: rode `supabase/005_push_avisos.local.sql` (cópia já preenchida com o seu segredo).
4. **Vercel**: cadastre também `VITE_VAPID_PUBLIC_KEY` (o mesmo `VAPID_PUBLIC_KEY`) e faça redeploy.
5. No celular, instale o app, abra o verso da capa e toque em **🔕 ativar avisos**.
   No iPhone o push só funciona com o app instalado na tela de início (iOS 16.4+).

## Publicar (para os dois acessarem de qualquer lugar)

Na **Vercel** ou **Netlify**: importe o repositório, use o comando de build `npm run build` e a pasta `dist`, e cadastre
as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` nas configurações do projeto.

## Como usar

- **Toque na capa** para abrir o diário já na página mais recente.
- Vire as páginas pelos **cantinhos** das folhas, pelas **setas** do teclado, **deslizando o dedo** no celular ou pelas fitas embaixo do livro.
- A última página é sempre uma **página em branco** para escrever (data, humor, título e texto).
- Nas páginas do outro dá para deixar reações 💗 🥹 😂 🫂. As suas páginas podem ser editadas ou "arrancadas".
- O que um escreve aparece na hora para o outro.
- No verso da capa (ex libris) ficam: editar perfil, ativar avisos, "juntos há X dias" e sair.
- **🗝️ gaveta** (nas fitinhas): bilhetinhos, cartas "abra quando…", pergunta do dia, nossa lista e contagens,
  retrospectiva, busca, calendário e **atualizações** (o que há de novo no diário).
- **🔍** ou a tecla **/** abre a busca.

## Estrutura

```
src/
  App.jsx                  fluxo: configuração → login → perfil → diário
  components/
    Desk.jsx               mesa de madeira, objetos e poeirinha de luz
    Book.jsx               livro 3D com folhas que viram (1 página no celular, 2 no computador)
    Diary.jsx              carrega dados, tempo real, monta as páginas
    pages.jsx              capa, ex libris, página escrita e formulário
    Login.jsx              login em cima da capa fechada
    ProfileSetup.jsx       nome, bichinho e cor
    reactbits/             componentes do React Bits (Particles, ClickSpark, BlurText, AnimatedContent)
  lib/
    supabase.js            usa o Supabase se o .env.local existir; senão o cliente local
    localClient.js         cliente local (localStorage) com páginas de exemplo
    book.js                helpers de paginação
supabase/schema.sql        tabelas, RLS e realtime
```
