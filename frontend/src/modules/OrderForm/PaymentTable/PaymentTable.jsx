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

  // 초기 데이터 설정을 위한 useEffect
  useEffect(() => {
    if (payment) {
      let totalConvertedAmount = 0;

      // 현금 결제 데이터가 있는 경우
      if (payment.cashAmount && payment.cashCurrency) {
        totalConvertedAmount += Number(payment.cashAmount);
      }
      // 카드 결제 데이터가 있는 경우
      if (payment.cardAmount && payment.cardCurrency) {
        totalConvertedAmount += Number(payment.cardAmount);
      }
      // 보상판매 데이터가 있는 경우
      if (payment.tradeInAmount && payment.tradeInCurrency) {
        totalConvertedAmount += Number(payment.tradeInAmount);
      }

      // 총액이 있는 경우 업데이트
      if (totalConvertedAmount > 0) {
        onPaymentChange({
          ...payment,
          totalConvertedAmount,
        });
      }
    }
  }, [payment, onPaymentChange]);

  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      const updatedPayment = {
        ...payment,
        [`${field}Amount`]: amount !== null ? Number(amount) : 0,
        [`${field}Currency`]: currency || null,
      };

      // 현재 필드의 환산액 계산
      const currentFieldAmount =
        field === "cash" ? Number(amount) || 0 : payment[`${field}Amount`] || 0;

      // 다른 필드들의 기존 금액 합산
      const otherFieldsAmount = Object.entries(payment)
        .filter(
          ([key, value]) =>
            key.endsWith("Amount") && !key.startsWith(field) && value !== null
        )
        .reduce((sum, [_, value]) => sum + Number(value), 0);

      // 총 환산액 계산
      const totalConvertedAmount = currentFieldAmount + otherFieldsAmount;

      onPaymentChange({
        ...updatedPayment,
        totalConvertedAmount,
        paymentMethod: payment.paymentMethod,
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
