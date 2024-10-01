import React, { useState, useCallback, useMemo } from "react";
import styles from "./CurrencyInput.module.css";

const exchangeRates = {
  KRW: 1,
  JPY: 1 / 9, // 1엔 = 약 9원
  USD: 1300, // 1달러 = 약 1300원
  GOLD_10K: 44820, // 1g당 약 44,820원
  GOLD_14K: 62748,
  GOLD_18K: 80676,
  GOLD_24K: 107568,
};

export const CurrencyInput = React.memo(
  ({ label, currencies, onChange, initialCurrency, initialAmount }) => {
    const [currency, setCurrency] = useState(initialCurrency || currencies[0]);
    const [amount, setAmount] = useState(initialAmount || 0);

    const handleCurrencyChange = useCallback(
      (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        const convertedAmount = Math.round(amount * exchangeRates[newCurrency]);
        onChange(amount, newCurrency, convertedAmount);
      },
      [amount, onChange]
    );

    const handleAmountChange = useCallback(
      (e) => {
        const newAmount = Number(e.target.value);
        setAmount(newAmount);
        const convertedAmount = Math.round(newAmount * exchangeRates[currency]);
        onChange(newAmount, currency, convertedAmount);
      },
      [currency, onChange]
    );

    const convertedAmount = useMemo(() => {
      return Math.round(amount * exchangeRates[currency]);
    }, [amount, currency]);

    const currencyOptions = useMemo(
      () =>
        currencies.map((curr) => (
          <option key={curr} value={curr}>
            {curr}
          </option>
        )),
      [currencies]
    );

    return (
      <tr>
        <td>{label}</td>
        <td>
          <select
            name={label}
            className={styles.currency}
            value={currency}
            onChange={handleCurrencyChange}
          >
            {currencyOptions}
          </select>
        </td>
        <td>
          <input
            type="number"
            className={styles.currencyInput}
            value={amount}
            onChange={handleAmountChange}
          />
        </td>
        <td>{convertedAmount.toLocaleString()} 원</td>
      </tr>
    );
  }
);
