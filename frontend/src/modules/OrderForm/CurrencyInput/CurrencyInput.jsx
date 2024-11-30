import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import styles from "./CurrencyInput.module.css";

export const CurrencyInput = React.memo(
  ({
    label,
    currencies,
    onChange,
    initialCurrency,
    initialAmount,
    initialConvertedAmount = 0,
    allowNull,
  }) => {
    const [amount, setAmount] = useState(initialAmount);
    const [currency, setCurrency] = useState(
      initialCurrency || (allowNull ? null : currencies[0])
    );
    const [convertedAmount, setConvertedAmount] = useState(
      initialConvertedAmount
    );
    const [isLoading, setIsLoading] = useState(false);

    const fetchAndCalculateRate = useCallback(
      async (newAmount, newCurrency) => {
        if (!newAmount || !newCurrency) {
          setConvertedAmount(0);
          onChange(newAmount || 0, newCurrency, 0);
          return;
        }

        setIsLoading(true);
        try {
          let rate;

          if (["10K", "14K", "18K", "24K"].includes(newCurrency)) {
            const response = await axios.get(
              `https://kristinahan-db64be049567.herokuapp.com/getGoldPriceInfo?page_no=1&num_of_rows=1&result_type=json&bas_dt=${new Date()
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "")}`
            );
            const goldPrices = response.data.items[0];
            const priceKey = `gold_${newCurrency.toLowerCase()}`;
            rate = Number(goldPrices[priceKey]) || 0;
          } else {
            const response = await axios.get(
              `https://kristinahan-db64be049567.herokuapp.com/getExchangeRateInfo?search_date=${new Date()
                .toISOString()
                .split("T")[0]
                .replace(/-/g, "")}`
            );

            rate = response.data.items.reduce(
              (acc, item) => {
                if (!item || !item.cur_unit) return acc;
                if (item.cur_unit === "JPY(100)" && newCurrency === "JPY") {
                  return Number(item.deal_bas_r) / 100;
                }
                if (item.cur_unit === newCurrency) {
                  return Number(item.deal_bas_r);
                }
                return acc;
              },
              newCurrency === "KRW" ? 1 : 0
            );
          }

          const newConvertedAmount = Math.round(Number(newAmount) * rate);

          console.log(`${label} conversion:`, {
            amount: newAmount,
            currency: newCurrency,
            convertedAmount: newConvertedAmount,
          });

          setConvertedAmount(newConvertedAmount);
          onChange(newAmount, newCurrency, newConvertedAmount);
        } catch (error) {
          console.error("Failed to fetch rates:", error);
        } finally {
          setIsLoading(false);
        }
      },
      [onChange, label]
    );

    useEffect(() => {
      if (initialCurrency && typeof initialAmount !== "undefined") {
        setCurrency(initialCurrency);
        setAmount(initialAmount);
        setConvertedAmount(initialConvertedAmount);
      }
    }, [initialCurrency, initialAmount, initialConvertedAmount]);

    const handleAmountChange = useCallback(
      (e) => {
        const inputValue = e.target.value;
        const numericValue = inputValue.replace(/[^0-9]/g, "");

        // 입력값이 비어있을 때
        if (inputValue === "") {
          setAmount("");
          if (currency) {
            fetchAndCalculateRate(0, currency);
          }
          return;
        }

        // 숫자로 변환
        const newAmount = parseInt(numericValue, 10);
        setAmount(newAmount);

        if (currency) {
          fetchAndCalculateRate(newAmount, currency);
        }
      },
      [currency, fetchAndCalculateRate]
    );

    const handleCurrencyChange = useCallback(
      (e) => {
        const newCurrency = e.target.value || null;
        setCurrency(newCurrency);

        const currentAmount = amount || 0;
        if (newCurrency) {
          fetchAndCalculateRate(currentAmount, newCurrency);
        } else {
          setConvertedAmount(0);
          onChange(currentAmount, newCurrency, 0);
        }
      },
      [amount, fetchAndCalculateRate, onChange]
    );

    return (
      <tr>
        <td>{label}</td>
        <td>
          <select
            name={label}
            className={`${styles.currency} ${isLoading ? styles.loading : ""}`}
            value={currency || ""}
            onChange={handleCurrencyChange}
            disabled={isLoading}
          >
            {allowNull && <option value="">선택</option>}
            {currencies.map((curr) => (
              <option key={curr} value={curr}>
                {curr}
              </option>
            ))}
          </select>
        </td>
        <td>
          <input
            type="text"
            className={`${styles.currencyInput} ${
              isLoading ? styles.loading : ""
            }`}
            value={amount}
            onChange={handleAmountChange}
            disabled={isLoading}
          />
        </td>
        <td>
          {isLoading ? (
            <span className={styles.loadingText}>
              환율 정보를 가져오는 중...
            </span>
          ) : (
            <span>{convertedAmount?.toLocaleString()} 원</span>
          )}
        </td>
      </tr>
    );
  }
);

export default CurrencyInput;
