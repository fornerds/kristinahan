import React, { useCallback, useState, useEffect } from "react";
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css";

const PaymentTable = ({
  payment = {},
  onPaymentChange,
  customerName,
  isEdit,
  label,
}) => {
  const [isDateSelected, setIsDateSelected] = useState(!!payment.payment_date);

  // 총액 계산 함수
  const calculateTotalAmount = useCallback((updatedPayment) => {
    return (
      (Number(updatedPayment.cashAmount) || 0) +
      (Number(updatedPayment.cardAmount) || 0) +
      (Number(updatedPayment.tradeInAmount) || 0)
    );
  }, []);

  // 초기 데이터 설정을 위한 useEffect
  useEffect(() => {
    if (payment && !payment.totalConvertedAmount) {
      const totalConvertedAmount = calculateTotalAmount(payment);

      if (
        totalConvertedAmount > 0 &&
        totalConvertedAmount !== payment.totalConvertedAmount
      ) {
        onPaymentChange({
          ...payment,
          totalConvertedAmount,
        });
      }
    }
  }, []); // 마운트 시에만 실행

  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      const updatedPayment = {
        ...payment,
        [`${field}Amount`]: amount !== null ? Number(amount) : 0,
        [`${field}Currency`]: currency || null,
      };

      const totalConvertedAmount = calculateTotalAmount(updatedPayment);

      onPaymentChange({
        ...updatedPayment,
        totalConvertedAmount,
        paymentMethod: payment.paymentMethod,
      });
    },
    [onPaymentChange, payment, calculateTotalAmount]
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

  const handleNotesChange = (e) => {
    onPaymentChange({
      ...payment,
      notes: e.target.value,
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
        <h4 className={styles.sectionLabel}>{label} 관련</h4>
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
            initialCurrency={payment.cashCurrency || "KRW"}
            initialAmount={payment.cashAmount || 0}
            allowNull={false}
          />
          <CurrencyInput
            label="카드"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("card")}
            initialCurrency={payment.cardCurrency || "KRW"}
            initialAmount={payment.cardAmount || 0}
            allowNull={false}
          />
          <CurrencyInput
            label="보상판매"
            currencies={["10K", "14K", "18K", "24K"]}
            onChange={handleCurrencyChange("tradeIn")}
            initialCurrency={payment.tradeInCurrency}
            initialAmount={payment.tradeInAmount || 0}
            allowNull={true}
          />
        </tbody>
      </table>
      <div className={styles.sectionVerticalGroup}>
        <h4 className={styles.sectionLabel}>결제자</h4>
        <div className={styles.sectionGroup}>
          <input
            type="text"
            className={styles.textInput}
            value={payment.payerName || ""}
            onChange={handlePayerNameChange}
          />
        </div>
      </div>
      <div className={styles.sectionVerticalGroup}>
        <h4 className={styles.sectionLabel}>비고</h4>
        <textarea
          value={payment.notes || ""}
          onChange={handleNotesChange}
          className={styles.notes}
        />
      </div>
    </div>
  );
};

export default React.memo(PaymentTable);
