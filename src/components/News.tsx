import React, { useState, useEffect } from 'react';
import '../styles/News.css';

const newsApiURL = '/api/api/news_info'

interface NewsItem {
    name_ru: string;
    html_ru: string;
    img: string;
    start_date: string;
    link: string;
}

const News: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await fetch(newsApiURL);
                if (!response.ok) {
                    throw new Error('Ошибка загрузки новостей');
                }
                const data = await response.json();
                
                const latestNews = data.slice(0, 5);
                setNews(latestNews);
            } catch (err) {
               console.error('Ошибка при получении новостей:', err);
            }
        };

        fetchNews();
    }, []);

    // Автоматическое переключение слайдов каждые 5 секунд
    useEffect(() => {
        if (news.length === 0) return;

        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % news.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [news.length]);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % news.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
    };

    const goToSlide = (index: number) => {
        setCurrentSlide(index);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (news.length === 0) {
        return <div className="news-empty">Нет новостей для отображения</div>;
    }

    return (
        <div className="news-container">
            <div className="news-slider">
                <div className="news-slide-wrapper">
                    {news.map((item, index) => (
                        <div
                            key={index}
                            className={`news-slide ${index === currentSlide ? 'active' : ''}`}
                        >
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="news-link"
                            >
                                <div className="news-image-container">
                                    <img 
                                        src={item.img} 
                                        alt={item.name_ru}
                                        className="news-image"
                                    />
                                    <div className="news-overlay">
                                        <h3 className="news-headline">{item.name_ru}</h3>
                                        <p className="news-date">{formatDate(item.start_date)}</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>

                {/* Кнопки навигации */}
                <button 
                    className="news-nav-button prev" 
                    onClick={prevSlide}
                    aria-label="Предыдущая новость"
                >
                    &#8249;
                </button>
                <button 
                    className="news-nav-button next" 
                    onClick={nextSlide}
                    aria-label="Следующая новость"
                >
                    &#8250;
                </button>

                {/* Индикаторы */}
                <div className="news-indicators">
                    {news.map((_, index) => (
                        <button
                            key={index}
                            className={`news-indicator ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`Перейти к новости ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default News;