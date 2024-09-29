import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { TabNavigation } from "../../../../modules";
import { Modal } from "../../../../modules/Modal/Modal";
import styles from "./Create.module.css";
import { useForms, useCreateEvent } from "../../../../api/hooks";

export const Create = () => {
  const navigate = useNavigate();
  const {
    data: forms,
    isLoading: isFormsLoading,
    isError: isFormsError,
  } = useForms();
  const createEventMutation = useCreateEvent();

  const [eventName, setEventName] = useState("");
  const [eventNameError, setEventNameError] = useState("");
  const [formId, setFormId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const validateEventName = useCallback((name) => {
    if (name.trim().length === 0) {
      setEventNameError("행사명은 필수입니다.");
      return false;
    }
    setEventNameError("");
    return true;
  }, []);

  const handleEventNameChange = useCallback(
    (e) => {
      const name = e.target.value;
      setEventName(name);
      validateEventName(name);
    },
    [validateEventName]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEventName(eventName)) {
      return;
    }
    try {
      await createEventMutation.mutateAsync({
        name: eventName,
        form_id: parseInt(formId),
        start_date: startDate,
        end_date: endDate,
        inProgress: inProgress,
      });
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "행사가 성공적으로 생성되었습니다.",
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message:
          "행사 생성에 실패했습니다: " +
          (error.response?.data?.detail || error.message),
      });
    }
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/event");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>행사 생성</h2>
        {isFormsLoading ? (
          <div>로딩 중...</div>
        ) : isFormsError ? (
          <div>주문서 양식을 불러오는 데 실패했습니다.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.sectionWrap}>
              <section className={styles.section}>
                <label htmlFor="eventName">
                  행사명 <p className={styles.required}>*</p>
                </label>
                <Input
                  id="eventName"
                  type="text"
                  className={`${styles.input} ${
                    eventNameError ? styles.inputError : ""
                  }`}
                  value={eventName}
                  onChange={handleEventNameChange}
                  required
                />
                {eventNameError && (
                  <p className={styles.errorMessage}>{eventNameError}</p>
                )}
              </section>
              <section className={styles.section}>
                <label htmlFor="orderFormName">주문서 양식</label>
                <select
                  name="orderFormName"
                  id={styles.orderFormName}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                >
                  <option value="">주문서 양식 선택</option>
                  {forms?.data.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </section>
              <section className={styles.flexSection}>
                <div className={styles.section}>
                  <label htmlFor="startDate">시작일</label>
                  <input
                    type="date"
                    name="startDate"
                    id="startDate"
                    className={styles.dateInput}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.section}>
                  <label htmlFor="endDate">종료일</label>
                  <input
                    type="date"
                    name="endDate"
                    id="endDate"
                    className={styles.dateInput}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </section>
              <section className={styles.section}>
                <label htmlFor="inProgress">진행 상태</label>
                <div className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id="inProgress"
                    checked={inProgress}
                    onChange={(e) => setInProgress(e.target.checked)}
                  />
                  <label htmlFor="inProgress">진행 중</label>
                </div>
              </section>
            </div>
            <div className={styles.buttonGroup}>
              <Link className={styles.cancelLink} to="/admin/event">
                취소
              </Link>
              <Button
                type="submit"
                className={styles.saveButton}
                label="저장"
                // disabled={!eventName.trim()}
              />
            </div>
          </form>
        )}
      </main>
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
    </div>
  );
};
