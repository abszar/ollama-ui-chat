# Ollama UI Chat

A modern desktop chat interface for Ollama AI models. This application provides a sleek, user-friendly interface for having conversations with locally running Ollama models, similar to ChatGPT but running completely offline.

## Features

- 🚀 Cross-platform desktop application (Windows, macOS, Linux)
- 🤖 Support for multiple Ollama models
- 🔄 Automatic model detection and selection
- 💬 Modern chat interface with streaming responses
- 📝 Full Markdown support with syntax highlighting
- 💾 Persistent chat history using localStorage
- 🔄 Conversation context management
- 🎨 Dark mode interface
- ✨ Code block syntax highlighting with line numbers
- 📋 One-click code copying
- 🏷️ Automatic chat title generation
- 📱 Responsive design

<img src="https://github.com/user-attachments/assets/ec67dd90-39d5-4724-9747-92cca3eb3de4" width="700">

## Prerequisites

Before running this application, make sure you have:

1. [Node.js](https://nodejs.org/) (v16 or higher)
2. [Ollama](https://ollama.ai/) installed and running locally
3. At least one Ollama model pulled (e.g., qwen2.5-coder, llama2, codellama)

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
3. Click "New Chat" to start a conversation
4. Select the model you want to use from the available models
5. Type your message and press Enter or click the send button
6. The AI will respond, maintaining context throughout the conversation

## Features in Detail

### Model Management
- Automatic detection of installed Ollama models
- Model selection for each chat session
- Model information display in chat interface
- Support for switching between different models

### Chat Management
- Create new chats with model selection
- Delete existing chats
- Edit chat titles
- Automatic title generation based on first message
- Model indicator for each chat

### Message Features
- Full Markdown rendering
- Syntax highlighted code blocks
- One-click code copying
- Message history persistence
- Real-time streaming responses
- Context-aware conversations

### User Interface
- Clean, modern design
- Dark mode
- Responsive layout
- Sidebar navigation with model indicators
- Message streaming
- Model information display

### Data Storage
- Local storage for chat history
- Automatic data persistence
- No external database required
- Fast and reliable data access

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Desktop Framework**: Electron
- **UI Components**: Material-UI (MUI)
- **Code Highlighting**: Prism.js
- **Markdown Rendering**: React Markdown
- **Build Tool**: Create React App with react-app-rewired
- **Storage**: Browser's localStorage API

## Project Structure

```
ollama-ui-chat/
├── public/
│   └── electron.js       # Electron main process
├── src/
│   ├── components/       # React components
│   ├── services/        # Service layer
│   ├── types/          # TypeScript types
│   └── App.tsx         # Main React component
└── package.json        # Project configuration
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
