
# Local Development Setup

To run this project locally in VS Code or any other editor, follow these steps:

1. Make sure you have Node.js installed (version 16 or higher recommended).

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to the URL shown in the terminal (typically http://localhost:3000)

## Troubleshooting

If you encounter issues:

1. Make sure all dependencies are installed by running `npm install` again.
2. Check if there are any errors in the VS Code terminal.
3. Try running with the `--force` flag: `npm run dev -- --force`
4. Clear your browser cache or try in incognito mode.
5. If using VS Code, install the React Developer Tools extension for better debugging.

## Building for Production

To build the project for production:
```bash
npm run build
```

This will create a `dist` folder with the built application.
