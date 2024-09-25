import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Link } from "../../../components";
import { TabNavigation, Modal } from "../../../modules";
import styles from "./OrderFormList.module.css";
import { useForms, useCreateForm } from "../../../api/hooks";

export const OrderFormList = () => {
  const navigate = useNavigate();
  const { data: forms, isLoading, isError } = useForms();
  const createFormMutation = useCreateForm();
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const handleRowClick = (id) => {
    navigate(`/admin/orderform/${id}`);
  };

  const handleCopyClick = async (e, form) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    try {
      const newFormName = `${form.name} 복제본`;
      const newForm = {
        ...form,
        name: newFormName,
        id: undefined, // 새 ID를 위해 제거
        created_at: undefined, // 새 생성 시간을 위해 제거
      };
      await createFormMutation.mutateAsync(newForm);
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: `'${newFormName}' 주문서 양식이 성공적으로 복제되었습니다.`,
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "주문서 양식 복제에 실패했습니다: " + error.message,
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
        <h2 className={styles.adminTitle}>주문서 양식 관리</h2>
        <section className={styles.section}>
          <div className={styles.actionButtonsWrap}>
            <Link to="/admin/orderform/create" className={styles.newOrderForm}>
              + 주문서양식 추가하기
            </Link>
          </div>
          {isLoading ? (
            <div>로딩 중...</div>
          ) : isError ? (
            <div>에러가 발생했습니다.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>주문서 양식 이름</th>
                  <th>카테고리 정보</th>
                  <th>생성일</th>
                  <th>복제 버튼</th>
                </tr>
              </thead>
              <tbody>
                {forms?.data.map((form) => (
                  <tr
                    key={form.id}
                    onClick={() => handleRowClick(form.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{form.name}</td>
                    <td>{form.categories.join(", ")}</td>
                    <td>{new Date(form.created_at).toLocaleDateString()}</td>
                    <td>
                      <Button
                        onClick={(e) => handleCopyClick(e, form)}
                        label="복제"
                        className={styles.copyButton}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
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
