Vara User Frontend
    This is the user-facing frontend for the Vara AI Music Platform, built with React and Vite. It consumes data managed via the Vara Admin Panel.

    ## Project Structure

    - `public/`: Static assets (e.g., `logo.png`).
    - `src/`: Main application source code.
      - `components/`: Reusable React components (e.g., for song cards, navigation items).
      - `App.jsx`: Main application component, handling overall layout and routing.
      - `config.js`: API base URL configuration.
      - `main.jsx`: Entry point for the React application.
      - `App.css`: Application-specific styles for main layout and components.
      - `index.css`: Global styles and CSS resets.
    - `package.json`: Project dependencies and scripts.
    - `vite.config.js`: Vite build configuration.

    ## Available Scripts

    In the project directory, you can run:

    ### `npm install`

    Installs all necessary dependencies.

    ### `npm run dev`

    Runs the app in development mode.
    Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

    The page will reload when you make changes.
    You may also see any lint errors in the console.

    ### `npm run build`

    Builds the app for production to the `dist` folder.
    It correctly bundles React in production mode and optimizes the build for the best performance.

    The build is minified and the filenames include the hashes.
    Your app is ready to be deployed!

    ### `npm start`

    Starts a static file server to serve the built `dist` folder.
    This is useful for testing the production build locally or for deployment on platforms like Render.
