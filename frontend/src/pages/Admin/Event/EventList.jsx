import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "../../../components";
import { TabNavigation } from "../../../modules";
import { Modal } from "../../../modules/Modal/Modal";
import styles from "./EventList.module.css";
import { useAllEvents, useUpdateEventProgress } from "../../../api/hooks";

export const EventList = () => {
  const navigate = useNavigate();
  const { data: events, isLoading, isError } = useAllEvents();
  const updateEventProgressMutation = useUpdateEventProgress();

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleRowClick = (id) => {
    navigate(`/admin/event/${id}`);
  };

  const handleSwitchClick = async (e, eventId, currentProgress) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    try {
      await updateEventProgressMutation.mutateAsync({
        eventId,
        inProgress: !currentProgress,
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "이벤트 진행 상태 업데이트에 실패했습니다.",
      });
    }
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>행사 관리</h2>
        {isLoading ? (
          <div>로딩 중...</div>
        ) : isError ? (
          <div>에러가 발생했습니다.</div>
        ) : (
          <section className={styles.section}>
            <div className={styles.actionButtonsWrap}>
              <Link to="/admin/event/create" className={styles.newEvent}>
                + 행사 추가하기
              </Link>
            </div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>행사명</th>
                  <th>주문서 양식</th>
                  <th>시작일</th>
                  <th>종료일</th>
                  <th>진행중 여부</th>
                </tr>
              </thead>
              <tbody>
                {events?.map((event) => (
                  <tr
                    key={event.id}
                    onClick={() => handleRowClick(event.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{event.name}</td>
                    <td>{event.form_name}</td>
                    <td>{event.start_date}</td>
                    <td>{event.end_date}</td>
                    <td>
                      <label
                        className={styles.switch}
                        onClick={(e) =>
                          handleSwitchClick(e, event.id, event.inProgress)
                        }
                      >
                        <input
                          type="checkbox"
                          checked={event.inProgress}
                          readOnly
                        />
                        <span className={styles.slider}></span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
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
