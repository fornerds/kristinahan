import React, { useCallback } from "react";
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css";

const PaymentTable = ({ payment, onPaymentChange }) => {
  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      onPaymentChange((prev) => ({
        ...prev,
        [`${field}Amount`]: amount,
        [`${field}Currency`]: currency,
        [`${field}ConvertedAmount`]: convertedAmount,
      }));
    },
    [onPaymentChange]
  );

  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    onPaymentChange({
      ...payment,
      payment_date: date.toISOString(),
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date)
      ? date.toISOString().split("T")[0]
      : "";
  };

  return (
    <div className={styles.sectionVerticalGroup}>
      <div className={styles.spacebetween}>
        <h4 className={styles.sectionLabel}>
          {payment.paymentMethod === "advance" ? "선입금" : "잔금"} 관련
        </h4>
        <div className={styles.sectionGroup}>
          <h4 className={styles.sectionLabel}>지급날짜</h4>
          <input
            type="date"
            value={formatDate(payment.payment_date)}
            onChange={handleDateChange}
            className={styles.prepaid}
          />
        </div>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col">지급방법</th>
            <th scope="col">화폐단위</th>
            <th scope="col">지급액</th>
            <th scope="col">원화환산액</th>
          </tr>
        </thead>
        <tbody>
          <CurrencyInput
            label="현금"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("cash")}
            initialCurrency={payment.cashCurrency}
            initialAmount={payment.cashAmount}
          />
          <CurrencyInput
            label="카드"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("card")}
            initialCurrency={payment.cardCurrency}
            initialAmount={payment.cardAmount}
          />
          <CurrencyInput
            label="보상판매"
            currencies={["GOLD_10K", "GOLD_14K", "GOLD_18K", "GOLD_24K"]}
            onChange={handleCurrencyChange("tradeIn")}
            initialCurrency={payment.tradeInCurrency}
            initialAmount={payment.tradeInAmount}
          />
        </tbody>
      </table>
      <div className={styles.sectionVerticalGroup}>
        <h4 className={styles.sectionLabel}>비고</h4>
        <textarea
          value={payment.notes}
          onChange={(e) =>
            onPaymentChange({ ...payment, notes: e.target.value })
          }
          className={styles.notes}
        />
      </div>
    </div>
  );
};

export default React.memo(PaymentTable);
