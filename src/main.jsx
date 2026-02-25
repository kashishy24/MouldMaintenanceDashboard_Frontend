import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducer";
import ThemeProvider from './utils/ThemeContext';
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from './App';

const store = configureStore({
  reducer: rootReducer,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <Router>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </Router>
  </Provider>
);
