# Instruções para Publicar no GitHub

## Passo 1: Criar um Repositório no GitHub

1. Acesse [https://github.com](https://github.com) e faça login
2. Clique no botão "New" (Novo) no canto superior direito
3. Dê um nome ao seu repositório (ex: sistema-gestao-estoque)
4. Mantenha o repositório como público
5. **Importante**: Não marque a opção "Initialize this repository with a README"
6. Clique em "Create repository"

## Passo 2: Configurar o Remote (se ainda não fez)

Substitua `seu-usuario` e `seu-repositorio` pelos valores corretos:

```bash
git remote add origin https://github.com/seu-usuario/seu-repositorio.git
```

## Passo 3: Fazer Push do Código

```bash
git push -u origin main
```

## Problemas Comuns

### Se receber um erro de autenticação:
1. Vá para Settings > Developer settings > Personal access tokens
2. Gere um novo token com permissões de repositório
3. Use o token quando solicitado ou configure credenciais do Git

### Se o push falhar por outro motivo:
```bash
git pull origin main --allow-unrelated-histories
```
Depois tente o push novamente.