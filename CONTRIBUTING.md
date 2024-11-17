# Contributing to Ollama UI Chat

First off, thank you for considering contributing to Ollama UI Chat! It's people like you that make this project better.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct, which is to treat all contributors and users with respect and create a positive environment for everyone.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* Use a clear and descriptive title
* Describe the exact steps which reproduce the problem
* Provide specific examples to demonstrate the steps
* Describe the behavior you observed after following the steps
* Explain which behavior you expected to see instead and why
* Include screenshots if possible

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* Use a clear and descriptive title
* Provide a step-by-step description of the suggested enhancement
* Provide specific examples to demonstrate the steps
* Describe the current behavior and explain which behavior you expected to see instead
* Explain why this enhancement would be useful

### Pull Requests

* Fork the repo and create your branch from `main`
* If you've added code that should be tested, add tests
* Ensure the test suite passes
* Make sure your code lints
* Update the documentation

## Development Process

1. Fork the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Write or update tests if needed
5. Run the test suite
6. Push your changes
7. Create a Pull Request

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/your-username/ollama-ui-chat.git

# Install dependencies
cd ollama-ui-chat
npm install

# Start development server
npm run electron-dev
```

### Code Style

* Use TypeScript for type safety
* Follow the existing code style
* Use meaningful variable and function names
* Add comments for complex logic
* Keep functions small and focused

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

## Project Structure

```
ollama-ui-chat/
├── public/           # Static files and Electron main process
├── src/             # Source code
│   ├── components/  # React components
│   ├── services/    # Business logic and API calls
│   ├── types/       # TypeScript type definitions
│   └── App.tsx      # Main React component
└── tests/           # Test files
```

## Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test-file.test.ts
```

## Documentation

* Keep README.md up to date
* Document new features
* Update API documentation if needed
* Add comments to your code

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing! 🎉
