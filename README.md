# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Create a .env file from the example.
cp .env.example .env

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Context API for state management
- CryptoJS for enhanced security

## Environment Variables

The project uses environment variables for configuration. Copy the `.env.example` file to `.env` and adjust the values as needed:

```bash
cp .env.example .env
```

Refer to `.env.example` for all available configuration options.

## Testing

The project includes unit and integration tests using Vitest and Testing Library:

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests once
npm run test:run
```

Tests are located in `src/**/*.test.ts` and `src/**/*.test.tsx` files.

## Improvements Made

This project has been enhanced with several improvements:

1. **Enhanced Security**: 
   - Implemented AES encryption using CryptoJS for sensitive data
   - Centralized security functions in a dedicated service

2. **State Management**:
   - Added Context API for global state management
   - Created a centralized AppContext for all data operations

3. **Code Structure**:
   - Refactored large components into smaller, more manageable pieces
   - Created a service layer for data operations
   - Removed duplicate files and code

4. **Type Safety**:
   - Enabled strict TypeScript settings
   - Improved type definitions throughout the application

5. **Performance**:
   - Optimized component rendering
   - Reduced unnecessary re-renders

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/67fb5fe8-5e69-47a5-a3eb-c460cbdd6db1) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)