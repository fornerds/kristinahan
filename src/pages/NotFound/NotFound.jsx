import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <div className={styles.center}>
            <div className={styles.errorCode}>404</div>
            <h1 className={styles.title}>페이지를 찾을 수 없습니다</h1>
            <p className={styles.message}>
              요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
            </p>
            <button onClick={() => navigate("/")} className={styles.button}>
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
