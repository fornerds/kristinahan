import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./CurrencyInput.module.css";

export const CurrencyInput = React.memo(
  ({ label, currencies, onChange, initialCurrency, initialAmount }) => {
    const [currency, setCurrency] = useState(initialCurrency || currencies[0]);
    const [amount, setAmount] = useState(initialAmount || 0);
    const [exchangeRates, setExchangeRates] = useState({
      KRW: 1,
      JPY: 1,
      USD: 1,
      GOLD_10K: 1,
      GOLD_14K: 1,
      GOLD_18K: 1,
      GOLD_24K: 1,
    });

    const fetchExchangeRates = async (date) => {
      try {
        const response = await axios.get(
          `https://kristinahan-db64be049567.herokuapp.com/getExchangeRateInfo?search_date=${date}`
        );
        const rates = response.data.items.reduce((acc, item) => {
          if (item.cur_unit === "JPY(100)") {
            acc["JPY"] = item.deal_bas_r / 100; // 100엔당 가격을 1엔당 가격으로 변환
          } else {
            acc[item.cur_unit] = item.deal_bas_r;
          }
          return acc;
        }, {});
        return rates;
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        return null;
      }
    };

    const fetchGoldPrices = async (date) => {
      try {
        const response = await axios.get(
          `https://kristinahan-db64be049567.herokuapp.com/getGoldPriceInfo?page_no=1&num_of_rows=1&result_type=json&bas_dt=${date}`
        );
        const goldPrices = response.data.items[0];
        return {
          GOLD_10K: goldPrices.gold_10k,
          GOLD_14K: goldPrices.gold_14k,
          GOLD_18K: goldPrices.gold_18k,
          GOLD_24K: goldPrices.gold_24k,
        };
      } catch (error) {
        console.error("Failed to fetch gold prices:", error);
        return null;
      }
    };

    useEffect(() => {
      const fetchRates = async () => {
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const rates = await fetchExchangeRates(today);
        const goldPrices = await fetchGoldPrices(today);
        if (rates && goldPrices) {
          setExchangeRates({ ...rates, ...goldPrices });
        }
      };
      fetchRates();
    }, []);

    const handleCurrencyChange = useCallback(
      (e) => {
        const newCurrency = e.target.value;
        setCurrency(newCurrency);
        const convertedAmount = Math.round(amount * exchangeRates[newCurrency]);
        onChange(amount, newCurrency, convertedAmount);
      },
      [amount, onChange, exchangeRates]
    );

    const handleAmountChange = useCallback(
      (e) => {
        const newAmount = Number(e.target.value);
        setAmount(newAmount);
        const convertedAmount = Math.round(newAmount * exchangeRates[currency]);
        onChange(newAmount, currency, convertedAmount);
      },
      [currency, onChange, exchangeRates]
    );

    const convertedAmount = useMemo(() => {
      return Math.round(amount * exchangeRates[currency]);
    }, [amount, currency, exchangeRates]);

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
