import React from "react"
import { Link } from "react-router-dom"
import '../styles/Header.css'

interface HeaderProps {
    image: string
}

const Header: React.FC<HeaderProps> = ({ image }) => {
    return (
        <header className="header">
            <nav>
                <Link to={'/'} className="header-logo">
                    <img src={image} alt="Logo" className="logo-image"/>
                </Link>
            </nav>
        </header>
    )
}

export default Header