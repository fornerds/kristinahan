import React, { useState, useEffect } from 'react';
import { CurrencyInput } from "../CurrencyInput";
import styles from "./PaymentTable.module.css"

export const PaymentTable = ({ title, onTotalChange }) => {
    const [cashAmount, setCashAmount] = useState(0);
    const [cardAmount, setCardAmount] = useState(0);
    const [goldAmount, setGoldAmount] = useState(0);
  
    useEffect(() => {
      onTotalChange(cashAmount + cardAmount + goldAmount);
    }, [cashAmount, cardAmount, goldAmount, onTotalChange]);
  
    return (
      <div className={styles.sectionVerticalGroup}>
        <div className={styles.spacebetween}>
          <h4 className={styles.sectionLabel}>{title} 관련</h4>
          <div className={styles.sectionGroup}>
            <h4 className={styles.sectionLabel}>{title} 지급날짜</h4>
            <input type="date" name={`${title}Date`} className={styles.prepaid} />
          </div>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{title}지급방법</th>
              <th scope="col">화폐단위</th>
              <th scope="col">지급액</th>
              <th scope="col">원화환산액</th>
            </tr>
          </thead>
          <tbody>
            <CurrencyInput label="현금" currencies={['원화', '엔화', '달러']} onChange={setCashAmount} />
            <CurrencyInput label="카드" currencies={['원화', '엔화', '달러']} onChange={setCardAmount} />
            <CurrencyInput label="보상판매" currencies={['금 10K', '금 14K', '금 18K', '금 24K']} onChange={setGoldAmount} />
          </tbody>
        </table>
      </div>
    );
  };