import React, { useEffect, useState } from "react";
import '../styles/currency.css'

const currencyApiURL = "/api/api/kurs_cards";

interface CurrencyData {
    kurs_date_time: string;
    USDCARD_in: string;
    USDCARD_out: string;
    EURCARD_in: string;
    EURCARD_out: string;
    RUBCARD_in: string;
    RUBCARD_out: string;
}

const Currency: React.FC = () => {
    const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);

    useEffect(() => {
        const fetchCurrencyData = async () => {
            try {
                const response = await fetch(currencyApiURL)
                if(!response.ok) {
                    throw new Error("Ошибка загрузки данных");
                }
                const data = await response.json()

                if(data && data.length > 0) {
                    setCurrencyData(data[0])
                }
                else throw new Error("Нет данных о курсах валют");
            }
            catch (error) {
                console.error("Ошибка при получении данных о курсах валют:", error);
            }
        }

        fetchCurrencyData()
    }, [])

    const formatDateTime = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
        });
  };

    if(!currencyData) {
        return <div className="currency-error">Нет данных о курсах валют</div>
    }

    return (
        <div className="currency-container">
            <div className="currency-header">
                <h3 className="currency-title">Курсы валют</h3>
                    <div className="currency-info">
                        <span className="currency-date">
                            Обновлено: {formatDateTime(currencyData.kurs_date_time)}
                        </span>
                        <span className="currency-source">
                            г.Минск, пр.Дзержинского, 18
                        </span>
                    </div>
            </div>

            <div className="currency-table">
                <div className="currency-item">
                    <div className="currency-name">1 доллар США</div>
                    <div className="currency-rate">
                        <span className="rate-buy">Покупка: {currencyData.USDCARD_in}</span>
                        <span className="rate-sell">Продажа: {currencyData.USDCARD_out}</span>
                     </div>
                </div>

                <div className="currency-item">
                    <div className="currency-name">1 евро</div>
                    <div className="currency-rate">
                        <span className="rate-buy">Покупка: {currencyData.EURCARD_in}</span>
                        <span className="rate-sell">Продажа: {currencyData.EURCARD_out}</span>
                     </div>
                </div>
            </div>

            <div className="currency-item">
                    <div className="currency-name">100 российских рублей</div>
                    <div className="currency-rate">
                        <span className="rate-buy">Покупка: {currencyData.RUBCARD_in}</span>
                        <span className="rate-sell">Продажа: {currencyData.RUBCARD_out}</span>
                     </div>
                </div>
        </div>
    )
}

export default Currency;