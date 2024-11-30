import React, { useCallback } from "react";
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css";

const PaymentTable = ({
  payment = {},
  onPaymentChange,
  customerName,
  isEdit,
  label,
}) => {
  const handleCurrencyChange = useCallback(
    (field) => (amount, currency, convertedAmount) => {
      console.log(`${field} payment changed:`, {
        amount,
        currency,
        convertedAmount,
      });

      const updatedPayment = { ...payment };

      // field에 따라 해당하는 결제 수단만 업데이트
      if (field === "cash") {
        if (amount > 0 && currency) {
          updatedPayment.cashAmount = amount;
          updatedPayment.cashCurrency = currency;
          updatedPayment.cashConversion = convertedAmount;
        } else {
          updatedPayment.cashAmount = null;
          updatedPayment.cashCurrency = null;
          updatedPayment.cashConversion = null;
        }
      } else if (field === "card") {
        if (amount > 0 && currency) {
          updatedPayment.cardAmount = amount;
          updatedPayment.cardCurrency = currency;
          updatedPayment.cardConversion = convertedAmount;
        } else {
          updatedPayment.cardAmount = null;
          updatedPayment.cardCurrency = null;
          updatedPayment.cardConversion = null;
        }
      } else if (field === "tradeIn") {
        if (amount > 0 && currency) {
          updatedPayment.tradeInAmount = amount;
          updatedPayment.tradeInCurrency = currency;
          updatedPayment.tradeInConversion = convertedAmount;
        } else {
          updatedPayment.tradeInAmount = null;
          updatedPayment.tradeInCurrency = null;
          updatedPayment.tradeInConversion = null;
        }
      }

      console.log("Updated payment:", updatedPayment);
      onPaymentChange(updatedPayment);
    },
    [payment, onPaymentChange]
  );

  const handleDateChange = (e) => {
    const date = e.target.value ? new Date(e.target.value) : null;
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
            initialCurrency={payment.cashCurrency}
            initialAmount={payment.cashAmount}
            initialConvertedAmount={payment.cashConversion}
            allowNull={false}
          />
          <CurrencyInput
            label="카드"
            currencies={["KRW", "JPY", "USD"]}
            onChange={handleCurrencyChange("card")}
            initialCurrency={payment.cardCurrency}
            initialAmount={payment.cardAmount}
            initialConvertedAmount={payment.cardConversion}
            allowNull={false}
          />
          <CurrencyInput
            label="보상판매"
            currencies={["10K", "14K", "18K", "24K"]}
            onChange={handleCurrencyChange("tradeIn")}
            initialCurrency={payment.tradeInCurrency}
            initialAmount={payment.tradeInAmount}
            initialConvertedAmount={payment.tradeInConversion}
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
