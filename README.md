# Ollama UI Chat

A modern desktop chat interface for Ollama AI models. This application provides a sleek, user-friendly interface for having conversations with locally running Ollama models, similar to ChatGPT but running completely offline.

## Features

- 🚀 Cross-platform desktop application (Windows, macOS, Linux)
- 💬 Modern chat interface with streaming responses
- 📝 Full Markdown support with syntax highlighting
- 💾 Persistent chat history with SQLite
- 🔄 Conversation context management
- 🎨 Dark mode interface
- ✨ Code block syntax highlighting with line numbers
- 📋 One-click code copying
- 🏷️ Automatic chat title generation
- 📱 Responsive design

## Prerequisites

Before running this application, make sure you have:

1. [Node.js](https://nodejs.org/) (v16 or higher)
2. [Ollama](https://ollama.ai/) installed and running locally
3. At least one Ollama model pulled (e.g., qwen2.5-coder)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ollama-ui-chat.git
cd ollama-ui-chat
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run electron-dev
```

## Building for Production

To create a production build:

```bash
npm run electron-pack
```

The packaged application will be available in the `dist` directory.

## Usage

1. Start Ollama on your machine
2. Launch Ollama UI Chat
3. Start a new chat using the "New Chat" button
4. Type your message and press Enter or click the send button
5. The AI will respond, maintaining context throughout the conversation

## Features in Detail

### Chat Management
- Create new chats
- Delete existing chats
- Edit chat titles
- Automatic title generation based on first message

### Message Features
- Full Markdown rendering
- Syntax highlighted code blocks
- One-click code copying
- Message history persistence
- Real-time streaming responses

### User Interface
- Clean, modern design
- Dark mode
- Responsive layout
- Sidebar navigation
- Message streaming

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Desktop Framework**: Electron
- **Database**: SQLite3
- **UI Components**: Material-UI (MUI)
- **Code Highlighting**: Prism.js
- **Markdown Rendering**: React Markdown
- **Build Tool**: Create React App with react-app-rewired

## Project Structure

```
ollama-ui-chat/
├── public/
│   ├── electron.js       # Electron main process
│   └── preload.js        # Preload script for IPC
├── src/
│   ├── components/       # React components
│   ├── services/         # Service layer
│   ├── types/           # TypeScript types
│   └── App.tsx          # Main React component
└── package.json         # Project configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. Check out our [Contributing Guidelines](CONTRIBUTING.md) for more details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ollama](https://ollama.ai/) for providing the AI model server
- [Electron](https://www.electronjs.org/) for the desktop application framework
- [React](https://reactjs.org/) for the UI framework
- [Material-UI](https://mui.com/) for the component library

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
