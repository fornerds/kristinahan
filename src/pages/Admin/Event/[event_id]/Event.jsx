import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import styles from "./Event.module.css";
import {
  useEventDetails,
  useUpdateEvent,
  useDeleteEvent,
  useForms,
} from "../../../../api/hooks";

export const Event = () => {
  const { event_id } = useParams();
  const navigate = useNavigate();
  const {
    data: event,
    isLoading: isEventLoading,
    isError: isEventError,
  } = useEventDetails(event_id);
  const {
    data: forms,
    isLoading: isFormsLoading,
    isError: isFormsError,
  } = useForms();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();

  const [eventName, setEventName] = useState("");
  const [formId, setFormId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (event) {
      setEventName(event.name || "");
      setFormId(event.form?.id.toString() || "");
      setStartDate(
        event.start_date
          ? new Date(event.start_date).toISOString().split("T")[0]
          : ""
      );
      setEndDate(
        event.end_date
          ? new Date(event.end_date).toISOString().split("T")[0]
          : ""
      );
      setInProgress(event.inProgress || false);
    }
  }, [event]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateEventMutation.mutateAsync({
        eventId: event_id,
        eventData: {
          name: eventName,
          form_id: parseInt(formId),
          start_date: startDate,
          end_date: endDate,
          inProgress: inProgress,
        },
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message:
          "행사 수정에 실패했습니다: " + (error.message || "알 수 없는 오류"),
      });
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteEventMutation.mutateAsync(event_id);
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "행사 삭제에 실패했습니다.",
      });
    }
    setIsDeleteModalOpen(false);
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
        <h2 className={styles.adminTitle}>행사 수정</h2>
        {isEventLoading || isFormsLoading ? (
          <div>로딩 중...</div>
        ) : isEventError || isFormsError ? (
          <div>에러가 발생했습니다.</div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.sectionWrap}>
              <section className={styles.section}>
                <label htmlFor="eventName">행사명</label>
                <Input
                  id="eventName"
                  type="text"
                  className={styles.input}
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  required
                />
              </section>
              <section className={styles.section}>
                <label htmlFor="orderFormName">주문서 양식</label>
                <select
                  id="orderFormName"
                  className={styles.select}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value)}
                  required
                >
                  <option value="">선택하세요</option>
                  {forms?.map((form) => (
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
            <div className={styles.spacebetween}>
              <Button
                onClick={handleDelete}
                label="삭제"
                className={styles.deleteProductButton}
                variant="danger"
              />
              <div className={styles.buttonGroup}>
                <Link className={styles.cancelLink} to="/admin/event">
                  취소
                </Link>
                <Button
                  type="submit"
                  className={styles.saveButton}
                  label="저장"
                />
              </div>
            </div>
          </form>
        )}
      </main>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="행사 삭제"
        message="정말로 해당 행사를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        cancelLabel="취소"
        onCancel={() => setIsDeleteModalOpen(false)}
      />
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={closeModal}
        title={modalInfo.title}
        message={modalInfo.message}
      />
    </div>
  );
};
