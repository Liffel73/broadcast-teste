# Broadcast SaaS

Teste pratico Full Stack com React, TypeScript, Firebase Auth, Firestore em tempo real, Firebase Functions e Firebase Hosting.

## Arquitetura

- `web`: frontend Vite + React + TypeScript + Material UI + Tailwind CSS.
- `functions`: Firebase Functions em TypeScript.
- `firestore.rules`: regras de seguranca multi-tenant.
- `firestore.indexes.json`: indice usado pela function de disparo agendado.

O Firestore usa apenas colecoes top-level:

- `connections`: conexoes do cliente autenticado.
- `contacts`: contatos vinculados por `connectionId`.
- `messages`: mensagens vinculadas por `connectionId`, com `contactIds` e status `scheduled` ou `sent`.

Todos os documentos possuem `ownerId`, e as regras garantem que um usuario autenticado leia e escreva somente seus proprios dados.

## Rodando localmente

1. Crie um projeto no Firebase.
2. Ative Email/Password em Authentication.
3. Crie um app Web no Firebase e copie as credenciais.
4. Crie `web/.env.local` usando `web/.env.example` como base.
5. Instale e rode:

```bash
cd web
npm install
npm run dev
```

Em outro terminal, para validar as functions:

```bash
cd functions
npm install
npm run build
```

## Deploy

Instale e autentique o Firebase CLI, selecione o projeto e execute:

```bash
firebase use --add
firebase deploy --only firestore,functions,hosting
```

Depois do deploy, envie o link do Firebase Hosting no formulario do teste.
