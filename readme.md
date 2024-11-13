# PulTime

This is a front-end application for managing tasks, allowing users to create, update, and delete tasks. This version of the application is built with plain HTML, CSS, and JavaScript, without using any frameworks. It connects to a back-end API to manage data.

## Features

- **User Authentication**: Register, login, and logout functionality.
- **Task CRUD Operations**: Create, view, update, and delete tasks.
- **Task Categorization**: Organize tasks by category, priority, and deadlines.
- **Responsive Design**: CSS for mobile-friendly design.
- **Notifications**: Provides feedback for actions (success, errors, etc.).

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- **Node.js** (for development server, if needed)
- **Task Manager API** server (set up back-end API from [API repository link](https://github.com/yourusername/task-manager-api))

### Installation

1. Clone this repository:

    ```bash
    git clone https://github.com/yourusername/task-manager-client.git
    cd task-manager-client
    ```

2. Configure environment variables:

    - Create a `.env` file in the root directory.
    - Add the following variable for API URL:

        ```plaintext
        API_URL=http://localhost:3000/api
        ```

3. Start a local server:

    - For testing, you can use a simple HTTP server. Run this command from the project root:

        ```bash
        npx http-server .
        ```

4. Open your browser and go to `http://localhost:8080` (or the specified port) to view the app.

## Project Structure

```plaintext
.
├── css                  # Stylesheets
├── js                   # JavaScript files
│   ├── main.js          # Main application logic
│   ├── api.js           # API interaction functions
│   ├── auth.js          # User authentication functions
│   └── ui.js            # UI manipulation functions
├── index.html           # Main HTML file
└── README.md            # Project documentation
```

## Key JavaScript Files

- **main.js**: Initializes the app and handles page navigation.
- **api.js**: Contains functions to make API calls (e.g., `login`, `getTasks`, `createTask`).
- **auth.js**: Manages user authentication status and session handling.
- **ui.js**: Handles DOM manipulation, such as showing/hiding elements, displaying task lists, and handling form submissions.

## API Integration

The front end communicates with the Task Manager API by making HTTP requests defined in `api.js`. Update the `API_URL` in the `.env` file to match your back-end server URL.

## Technologies Used

- **HTML**: Structure of the web pages.
- **CSS**: Styling for the application, including responsiveness.
- **JavaScript**: Dynamic functionality and API integration.
- **Fetch API**: For making HTTP requests.

## Contributing

Feel free to contribute by creating a pull request. For major changes, please open an issue first to discuss the change.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [MDN Web Docs](https://developer.mozilla.org/) for HTML, CSS, and JavaScript resources.
- [Fetch API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
