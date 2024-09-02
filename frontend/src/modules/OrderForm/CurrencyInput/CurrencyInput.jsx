import React, { useState, useEffect } from 'react';
import styles from "./CurrencyInput.module.css"

const exchangeRates = {
    원화: 1,
    엔화: 9,  // 1엔 = 약 9원
    달러: 1300,  // 1달러 = 약 1300원
    '금 10K': 44820,  // 1g당 약 44,820원
    '금 14K': 62748,
    '금 18K': 80676,
    '금 24K': 107568,
};

export const CurrencyInput = ({ label, currencies, onChange }) => {
    const [currency, setCurrency] = useState(currencies[0]);
    const [amount, setAmount] = useState(0);
  
    useEffect(() => {
      const converted = amount * exchangeRates[currency];
      onChange(Math.round(converted));
    }, [currency, amount, onChange]);
  
    return (
      <tr>
        <td>{label}</td>
        <td>
          <select 
            name={label} 
            className={styles.currency}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((curr) => (
              <option key={curr} value={curr}>{curr}</option>
            ))}
          </select>
        </td>
        <td>
          <input 
            type="number" 
            className={styles.currencyInput} 
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
        </td>
        <td>{Math.round(amount * exchangeRates[currency]).toLocaleString()} 원</td>
      </tr>
    );
  };