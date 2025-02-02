import React, { useCallback, useRef } from "react";
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css";

const PaymentTable = ({
  payment = {},
  onPaymentChange,
  customerName,
  isEdit,
  label,
}) => {
  const prevPaymentRef = useRef(payment);

  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      const prevValue = prevPaymentRef.current;
      const isSameValue =
        field === "cash"
          ? prevValue.cashAmount === amount &&
            prevValue.cashCurrency === currency &&
            prevValue.cashConversion === convertedAmount
          : field === "card"
          ? prevValue.cardAmount === amount &&
            prevValue.cardCurrency === currency &&
            prevValue.cardConversion === convertedAmount
          : field === "tradeIn"
          ? prevValue.tradeInAmount === amount &&
            prevValue.tradeInCurrency === currency &&
            prevValue.tradeInConversion === convertedAmount
          : false;

      if (isSameValue) {
        return;
      }

      const updatedPayment = { ...payment };

      const updateFields = {
        cash: () => {
          if (amount > 0 && currency) {
            updatedPayment.cashAmount = amount;
            updatedPayment.cashCurrency = currency;
            updatedPayment.cashConversion = convertedAmount;
          } else {
            updatedPayment.cashAmount = null;
            updatedPayment.cashCurrency = null;
            updatedPayment.cashConversion = null;
          }
        },
        card: () => {
          if (amount > 0 && currency) {
            updatedPayment.cardAmount = amount;
            updatedPayment.cardCurrency = currency;
            updatedPayment.cardConversion = convertedAmount;
          } else {
            updatedPayment.cardAmount = null;
            updatedPayment.cardCurrency = null;
            updatedPayment.cardConversion = null;
          }
        },
        tradeIn: () => {
          if (amount > 0 && currency) {
            updatedPayment.tradeInAmount = amount;
            updatedPayment.tradeInCurrency = currency;
            updatedPayment.tradeInConversion = convertedAmount;
          } else {
            updatedPayment.tradeInAmount = null;
            updatedPayment.tradeInCurrency = null;
            updatedPayment.tradeInConversion = null;
          }
        },
      };

      updateFields[field]();
      prevPaymentRef.current = updatedPayment;
      onPaymentChange(updatedPayment);
    },
    [payment, onPaymentChange]
  );

  const handleDateChange = (e) => {
    const selectedDate = e.target.value;
    if (selectedDate) {
      // 선택된 날짜의 UTC 시간을 해당 날짜의 자정으로 설정
      const date = new Date(selectedDate);
      date.setUTCHours(0, 0, 0, 0);
      onPaymentChange({
        ...payment,
        payment_date: date.toISOString(),
      });
    } else {
      onPaymentChange({
        ...payment,
        payment_date: null,
      });
    }
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

    // ISO 문자열에서 날짜 부분만 추출
    const date = dateString.split("T")[0];
    return date;
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
            key={`cash-${payment.payment_date}`}
            label="현금"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("cash")}
            initialCurrency={payment.cashCurrency}
            initialAmount={payment.cashAmount}
            initialConvertedAmount={payment.cashConversion}
            allowNull={false}
            selectedDate={payment.payment_date}
          />
          <CurrencyInput
            key={`card-${payment.payment_date}`}
            label="카드"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("card")}
            initialCurrency={payment.cardCurrency}
            initialAmount={payment.cardAmount}
            initialConvertedAmount={payment.cardConversion}
            allowNull={false}
            selectedDate={payment.payment_date}
          />
          <CurrencyInput
            key={`tradeIn-${payment.payment_date}`}
            label="보상판매"
            currencies={["10K", "14K", "18K", "24K"]}
            onChange={handleCurrencyChange("tradeIn")}
            initialCurrency={payment.tradeInCurrency}
            initialAmount={payment.tradeInAmount}
            initialConvertedAmount={payment.tradeInConversion}
            allowNull={true}
            selectedDate={payment.payment_date}
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
