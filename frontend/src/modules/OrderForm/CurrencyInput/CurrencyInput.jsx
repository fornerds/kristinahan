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

    // 환율 정보 가져오기
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

    // 금 시세 정보 가져오기
    const fetchGoldPrices = async (date) => {
      try {
        const response = await axios.get(
          `https://kristinahan-db64be049567.herokuapp.com/getGoldPriceInfo?page_no=1&num_of_rows=1&result_type=json&bas_dt=${date}`
        );
        const goldPrices = response.data.items[0];
        return {
          "10K": goldPrices.gold_10k,
          "14K": goldPrices.gold_14k,
          "18K": goldPrices.gold_18k,
          "24K": goldPrices.gold_24k,
        };
      } catch (error) {
        console.error("Failed to fetch gold prices:", error);
        return null;
      }
    };

    // 초기 환율과 금 시세 정보 로드
    useEffect(() => {
      const fetchRates = async () => {
        const today = new Date().toISOString().split("T")[0].replace(/-/g, "");
        const rates = await fetchExchangeRates(today);
        const gold = await fetchGoldPrices(today);
        if (rates) setExchangeRates(rates);
        if (gold) setGoldPrices(gold);
      };
      fetchRates();
    }, []);

    // 외부에서 들어오는 초기값 변경을 감지하여 상태 업데이트
    useEffect(() => {
      if (initialAmount !== undefined) {
        setAmount(initialAmount);
        const convertedAmount = calculateConvertedAmount(
          initialAmount,
          currency
        );
        onChange(initialAmount, currency, convertedAmount);
      }
    }, [initialAmount]);

    useEffect(() => {
      if (initialCurrency) {
        setCurrency(initialCurrency);
        const convertedAmount = calculateConvertedAmount(
          amount,
          initialCurrency
        );
        onChange(amount, initialCurrency, convertedAmount);
      }
    }, [initialCurrency]);

    // 환산 금액 계산
    const calculateConvertedAmount = useCallback(
      (newAmount, newCurrency) => {
        if (newAmount === null || !newCurrency) return null;
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

    // 통화 변경 핸들러
    const handleCurrencyChange = useCallback(
      (e) => {
        const newCurrency = e.target.value || null;
        setCurrency(newCurrency);
        const convertedAmount = calculateConvertedAmount(amount, newCurrency);
        onChange(amount, newCurrency, convertedAmount);
      },
      [amount, onChange, calculateConvertedAmount]
    );

    // 금액 변경 핸들러
    const handleAmountChange = useCallback(
      (e) => {
        const newAmount =
          e.target.value === "" ? null : Math.max(0, Number(e.target.value));
        setAmount(newAmount);
        const convertedAmount = calculateConvertedAmount(newAmount, currency);
        onChange(newAmount, currency, convertedAmount);
      },
      [currency, onChange, calculateConvertedAmount]
    );

    // 환산 금액 계산 (메모이제이션)
    const convertedAmount = useMemo(
      () => calculateConvertedAmount(amount, currency),
      [amount, currency, calculateConvertedAmount]
    );

    // 통화 옵션 메모이제이션
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
            value={currency || ""}
            onChange={handleCurrencyChange}
          >
            {allowNull && <option value="">선택</option>}
            {currencyOptions}
          </select>
        </td>
        <td>
          <input
            type="number"
            min="0"
            className={styles.currencyInput}
            value={amount !== null ? amount : ""}
            onChange={handleAmountChange}
            key={`${label}-${initialAmount}`}
          />
        </td>
        <td>
          {convertedAmount !== null && !isNaN(convertedAmount)
            ? convertedAmount.toLocaleString() + " 원"
            : "-"}
        </td>
      </tr>
    );
  }
);

export default CurrencyInput;
