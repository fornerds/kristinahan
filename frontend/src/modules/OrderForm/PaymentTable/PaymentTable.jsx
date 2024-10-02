import React, { useCallback, useState, useEffect } from "react";
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css";

const PaymentTable = ({ payment, onPaymentChange, customerName, isEdit }) => {
  const [isDateSelected, setIsDateSelected] = useState(false);

  useEffect(() => {
    // 수정 페이지이고 기존 날짜 데이터가 있는 경우
    if (isEdit && payment.payment_date) {
      setIsDateSelected(true);
    }
  }, [isEdit, payment.payment_date]);

  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      onPaymentChange({
        ...payment,
        [`${field}Amount`]: amount,
        [`${field}Currency`]: currency,
        [`${field}ConvertedAmount`]: convertedAmount,
      });
    },
    [onPaymentChange, payment]
  );

  const handleDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    setIsDateSelected(!!date);
    onPaymentChange({
      ...payment,
      payment_date: date ? date.toISOString() : null,
    });
  };

  const handlePayerNameChange = (e) => {
    onPaymentChange({
      ...payment,
      payerName: e.target.value,
    });
  };

  const handleSameAsCustomerChange = (e) => {
    onPaymentChange({
      ...payment,
      payerName: e.target.checked ? customerName : "",
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
      {isDateSelected && (
        <>
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
            <h4 className={styles.sectionLabel}>결제자</h4>
            <div className={styles.sectionGroup}>
              <input
                type="text"
                className={styles.textInput}
                value={payment.payerName}
                onChange={handlePayerNameChange}
              />
              <div className={styles.sectionGroup}>
                <input
                  type="checkbox"
                  id={`takeCustomerName_${payment.paymentMethod}`}
                  checked={payment.payerName === customerName}
                  onChange={handleSameAsCustomerChange}
                />
                <label
                  htmlFor={`takeCustomerName_${payment.paymentMethod}`}
                  className={styles.checkboxLabel}
                >
                  주문자와 동일
                </label>
              </div>
            </div>
          </div>
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
        </>
      )}
    </div>
  );
};

export default React.memo(PaymentTable);
