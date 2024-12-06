import React, { useState, useEffect, useCallback, useRef } from "react";
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
    selectedDate,
  }) => {
    const [amount, setAmount] = useState(initialAmount);
    const [currency, setCurrency] = useState(
      initialCurrency || (allowNull ? null : currencies[0])
    );
    const [convertedAmount, setConvertedAmount] = useState(
      initialConvertedAmount
    );
    const [isLoading, setIsLoading] = useState(false);
    const lastFetchedDate = useRef(null);
    const lastFetchedAmount = useRef(null);
    const lastFetchedCurrency = useRef(null);
    const pendingAmount = useRef(null);

    const getFormattedDate = useCallback((date) => {
      if (!date) return null;
      return new Date(date).toISOString().split("T")[0].replace(/-/g, "");
    }, []);

    const fetchAndCalculateRate = useCallback(
      async (newAmount, newCurrency, date, isInitialFetch = false) => {
        // 값이 없거나 KRW인 경우 즉시 반환
        if (!newCurrency || newCurrency === "KRW") {
          const finalAmount = newCurrency === "KRW" ? newAmount : 0;
          setConvertedAmount(finalAmount);
          onChange(newAmount || 0, newCurrency, finalAmount);
          return;
        }

        const formattedDate =
          getFormattedDate(date) || getFormattedDate(new Date());

        // 이전 요청과 동일한 조건이면서 초기 fetch가 아닌 경우 재요청하지 않음
        if (
          !isInitialFetch &&
          lastFetchedDate.current === formattedDate &&
          lastFetchedAmount.current === newAmount &&
          lastFetchedCurrency.current === newCurrency
        ) {
          return;
        }

        setIsLoading(true);
        try {
          let rate;
          if (["10K", "14K", "18K", "24K"].includes(newCurrency)) {
            const response = await axios.get(
              `https://kristinahan-db64be049567.herokuapp.com/getGoldPriceInfo?page_no=1&num_of_rows=1&result_type=json&bas_dt=${formattedDate}`
            );
            const goldPrices = response.data.items[0];
            const priceKey = `gold_${newCurrency.toLowerCase()}`;
            rate = Number(goldPrices[priceKey]) || 0;
          } else {
            const response = await axios.get(
              `https://kristinahan-db64be049567.herokuapp.com/getExchangeRateInfo?search_date=${formattedDate}`
            );
            rate = response.data.items.reduce((acc, item) => {
              if (!item || !item.cur_unit) return acc;
              if (item.cur_unit === "JPY(100)" && newCurrency === "JPY") {
                return Number(item.deal_bas_r) / 100;
              }
              if (item.cur_unit === newCurrency) {
                return Number(item.deal_bas_r);
              }
              return acc;
            }, 0);
          }

          const newConvertedAmount = Math.round(Number(newAmount) * rate);

          // 현재 요청 정보 저장
          lastFetchedDate.current = formattedDate;
          lastFetchedAmount.current = newAmount;
          lastFetchedCurrency.current = newCurrency;

          setConvertedAmount(newConvertedAmount);
          onChange(newAmount, newCurrency, newConvertedAmount);
        } catch (error) {
          console.error("Failed to fetch rates:", error);
        } finally {
          setIsLoading(false);
        }
      },
      [onChange, getFormattedDate]
    );

    // 초기값 설정
    useEffect(() => {
      if (initialCurrency && typeof initialAmount !== "undefined") {
        setCurrency(initialCurrency);
        setAmount(initialAmount);
        setConvertedAmount(initialConvertedAmount);
      }
    }, [initialCurrency, initialAmount, initialConvertedAmount]);

    // 수정된 handleAmountChange 함수
    const handleAmountChange = useCallback((e) => {
      const inputValue = e.target.value;

      // 빈 입력값 처리
      if (inputValue === "") {
        setAmount("");
        pendingAmount.current = 0;
        return;
      }

      // 숫자만 허용하고 콤마 제거
      const numericValue = inputValue.replace(/[^\d]/g, "");

      if (numericValue !== "") {
        const newAmount = parseInt(numericValue, 10);
        setAmount(newAmount);
        pendingAmount.current = newAmount;
      }
    }, []);

    // 입력 완료 시 처리
    const handleBlur = useCallback(() => {
      if (pendingAmount.current !== null && currency) {
        fetchAndCalculateRate(pendingAmount.current, currency, selectedDate);
        pendingAmount.current = null;
      }
    }, [currency, fetchAndCalculateRate, selectedDate]);

    // 키보드 이벤트 처리
    const handleKeyDown = useCallback((e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.target.blur();
      }
    }, []);

    // 수정된 handleCurrencyChange 함수
    const handleCurrencyChange = useCallback(
      (e) => {
        const newCurrency = e.target.value || null;
        setCurrency(newCurrency);

        // KRW인 경우 즉시 변환
        if (newCurrency === "KRW") {
          const currentAmount = pendingAmount.current || amount || 0;
          setConvertedAmount(currentAmount);
          onChange(currentAmount, newCurrency, currentAmount);
          return;
        }

        // 화폐 단위 변경 시 초기 환율 정보 가져오기 (amount는 0으로 설정)
        if (newCurrency) {
          fetchAndCalculateRate(0, newCurrency, selectedDate, true);
        } else {
          setConvertedAmount(0);
          onChange(0, null, 0);
        }
      },
      [amount, fetchAndCalculateRate, onChange, selectedDate]
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
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
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
