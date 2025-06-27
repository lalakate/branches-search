import { Route, Routes } from "react-router-dom";
import Header from "./components/Header";
import SearchPage from "./SearchPage";
import HomePage from "./HomePage";
import './App.css';

function App() {
    return (
        <div className="App">
            <Header image="./images/logo.png" />
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
            </Routes>
        </div>
    )
}

export default App;