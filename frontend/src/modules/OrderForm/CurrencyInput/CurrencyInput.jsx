import React, { useState, useCallback, useMemo, useEffect } from "react";
import axios from "axios";
import styles from "./CurrencyInput.module.css";

export const CurrencyInput = React.memo(
  ({
    label,
    currencies,
    onChange,
    initialCurrency,
    initialAmount,
    allowNull,
  }) => {
    const [currency, setCurrency] = useState(
      initialCurrency || (allowNull ? null : currencies[0])
    );
    const [amount, setAmount] = useState(
      initialAmount !== undefined ? initialAmount : allowNull ? null : 0
    );
    const [exchangeRates, setExchangeRates] = useState({
      KRW: 1,
      JPY: 1,
      USD: 1,
    });
    const [goldPrices, setGoldPrices] = useState({
      "10K": 1,
      "14K": 1,
      "18K": 1,
      "24K": 1,
    });
    const [isLoading, setIsLoading] = useState(false);

    // 환율 정보 가져오기
    const fetchExchangeRates = async (date) => {
      try {
        const response = await axios.get(
          `https://kristinahan-db64be049567.herokuapp.com/getExchangeRateInfo?search_date=${date}`
        );
        const rates = response.data.items.reduce(
          (acc, item) => {
            const convertToNumber = (value) => {
              if (typeof value === "string") {
                return parseFloat(value.replace(/,/g, ""));
              }
              return parseFloat(value);
            };

            if (item.cur_unit === "JPY(100)") {
              acc["JPY"] = convertToNumber(item.deal_bas_r) / 100; // 100엔당 가격을 1엔당 가격으로 변환
            } else if (item.cur_unit === "USD") {
              acc[item.cur_unit] = convertToNumber(item.deal_bas_r);
            }
            return acc;
          },
          {
            KRW: 1, // KRW는 항상 1로 고정
          }
        );
        return rates;
      } catch (error) {
        console.error("Failed to fetch exchange rates:", error);
        return null;
      }
    };

    // 금 시세 정보 가져오기
    const fetchGoldPrices = async (date) => {
      try {
        const response = await axios.get(
          `https://kristinahan-db64be049567.herokuapp.com/getGoldPriceInfo?page_no=1&num_of_rows=1&result_type=json&bas_dt=${date}`
        );
        const goldPrices = response.data.items[0];

        const convertToNumber = (value) => {
          if (typeof value === "string") {
            return parseFloat(value.replace(/,/g, ""));
          }
          return parseFloat(value);
        };

        return {
          "10K": convertToNumber(goldPrices.gold_10k),
          "14K": convertToNumber(goldPrices.gold_14k),
          "18K": convertToNumber(goldPrices.gold_18k),
          "24K": convertToNumber(goldPrices.gold_24k),
        };
      } catch (error) {
        console.error("Failed to fetch gold prices:", error);
        return null;
      }
    };

    const fetchRates = async () => {
      setIsLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const [rates, gold] = await Promise.all([
          fetchExchangeRates(today),
          fetchGoldPrices(today),
        ]);

        if (rates) setExchangeRates(rates);
        if (gold) setGoldPrices(gold);

        // 새로운 환율로 현재 값을 다시 계산
        if (amount && currency) {
          const newConvertedAmount = calculateConvertedAmount(
            amount,
            currency,
            rates,
            gold
          );
          onChange(amount, currency, newConvertedAmount);
        }
      } catch (error) {
        console.error("Failed to fetch rates:", error);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      if (initialAmount !== undefined || initialCurrency) {
        const newAmount = initialAmount || 0;
        const newCurrency = initialCurrency || currencies[0];

        setAmount(newAmount);
        setCurrency(newCurrency);

        // 환율 정보를 가져온 후 환산액 계산
        fetchRates().then(() => {
          const convertedAmount = calculateConvertedAmount(
            newAmount,
            newCurrency
          );
          onChange(newAmount, newCurrency, convertedAmount);
        });
      }
    }, [initialAmount, initialCurrency]);

    useEffect(() => {
      fetchRates();
    }, []); // 컴포넌트 마운트 시 한 번만 실행

    const calculateConvertedAmount = useCallback(
      (newAmount, newCurrency) => {
        if (newAmount === null || !newCurrency) return 0;
        if (["10K", "14K", "18K", "24K"].includes(newCurrency)) {
          return Math.round(Math.max(0, newAmount) * goldPrices[newCurrency]);
        } else {
          return Math.round(
            Math.max(0, newAmount) * exchangeRates[newCurrency]
          );
        }
      },
      [exchangeRates, goldPrices]
    );

    const handleAmountChange = useCallback(
      (e) => {
        const inputValue = e.target.value.replace(/[^0-9.]/g, "");

        if (inputValue === "") {
          setAmount(0);
          const convertedAmount = calculateConvertedAmount(0, currency);
          onChange(0, currency, convertedAmount);
          return;
        }

        const newAmount = parseFloat(inputValue);
        if (!isNaN(newAmount)) {
          setAmount(newAmount);
          const convertedAmount = calculateConvertedAmount(newAmount, currency);
          onChange(newAmount, currency, convertedAmount);
        }
      },
      [currency, onChange, calculateConvertedAmount]
    );

    const handleCurrencyChange = useCallback(
      async (e) => {
        const newCurrency = e.target.value || null;
        setCurrency(newCurrency);

        // 통화가 변경되면 환율 정보를 새로 가져옴
        if (newCurrency && newCurrency !== currency) {
          await fetchRates();
        }

        const convertedAmount = calculateConvertedAmount(amount, newCurrency);
        onChange(amount, newCurrency, convertedAmount);
      },
      [amount, currency, onChange, calculateConvertedAmount]
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
            value={amount !== null ? amount : ""}
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
            <span>
              {calculateConvertedAmount(amount, currency).toLocaleString()} 원
            </span>
          )}
        </td>
      </tr>
    );
  }
);

export default CurrencyInput;
