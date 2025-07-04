import { Link } from "react-router-dom"
import "./styles/home-page.css"
import Currency from "./components/Currency";
import News from "./components/News";

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <div className="news">
                <News />
            </div>
            <div className="search-currency">
                <Currency />
                <Link to='/search' className="search-button">
                    <p className="search-button-text">Поиск областных управлений, ЦБУ и отделений</p>
                </Link>
            </div>
        </div>
    )
}

export default HomePage;