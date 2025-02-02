import React, { useEffect, useState } from "react";
import { TabNavigation, Modal } from "../../../modules";
import { ReactComponent as DeleteIcon } from "../../../asset/icon/delete.svg";
import { ReactComponent as EditIcon } from "../../../asset/icon/order_form.svg";
import { Button, Input } from "../../../components";
import styles from "./WriterList.module.css";
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from "../../../api/hooks";

export const WriterList = () => {
  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>작성자 관리</h2>
        <AuthorManagement />
      </main>
    </div>
  );
};

const AuthorManagement = () => {
  const { data: authorsData, isLoading, isError } = useAuthors();
  const createAuthorMutation = useCreateAuthor();
  const updateAuthorMutation = useUpdateAuthor();
  const deleteAuthorMutation = useDeleteAuthor();

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    type: "",
    author: null,
  });
  const [newAuthorName, setNewAuthorName] = useState("");

  const handleAddAuthor = () => {
    setModalInfo({ isOpen: true, type: "add" });
  };

  const handleUpdateAuthor = (author) => {
    setModalInfo({ isOpen: true, type: "update", author });
    setNewAuthorName(author.name);
  };

  const handleDeleteAuthor = (author) => {
    setModalInfo({ isOpen: true, type: "delete", author });
  };

  const handleModalConfirm = async () => {
    try {
      if (modalInfo.type === "add") {
        await createAuthorMutation.mutateAsync({ name: newAuthorName });
      } else if (modalInfo.type === "update") {
        await updateAuthorMutation.mutateAsync({
          authorId: modalInfo.author.id,
          authorData: { name: newAuthorName },
        });
      } else if (modalInfo.type === "delete") {
        await deleteAuthorMutation.mutateAsync(modalInfo.author.id);
      }
      handleModalClose();
    } catch (error) {
      console.error("Operation failed:", error);
      // 에러 처리는 hooks 내부에서 이루어지므로 여기서는 로깅만 합니다.
    }
  };

  const handleModalClose = () => {
    setModalInfo({ isOpen: false, type: "", author: null });
    setNewAuthorName("");
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError)
    return <div>에러가 발생했습니다. 페이지를 새로고침해 주세요.</div>;

  return (
    <div className={styles.tableWrap}>
      <div className={styles.managementSection}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>이름</th>
              <th>수정</th>
              <th>삭제</th>
            </tr>
          </thead>
          <tbody>
            {authorsData.map((author) => (
              <tr key={author.id}>
                <td>{author.name}</td>
                <td>
                  <Button
                    onClick={() => handleUpdateAuthor(author)}
                    className={styles.editButton}
                    disabled={updateAuthorMutation.isLoading}
                  >
                    <EditIcon fill="white" />
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => handleDeleteAuthor(author)}
                    className={styles.deleteButton}
                    aria-label="삭제"
                    variant="danger"
                    disabled={deleteAuthorMutation.isLoading}
                  >
                    <DeleteIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          onClick={handleAddAuthor}
          label="+ 추가하기"
          className={styles.addButton}
          disabled={createAuthorMutation.isLoading}
        />
      </div>
      <Modal
        isOpen={modalInfo.isOpen}
        onClose={handleModalClose}
        onCancel={handleModalClose}
        cancelLabel="취소"
        title={
          modalInfo.type === "add"
            ? "작성자 추가"
            : modalInfo.type === "update"
            ? "작성자 수정"
            : "작성자 삭제"
        }
        message={
          modalInfo.type === "delete"
            ? `정말로 ${modalInfo.author?.name}을(를) 삭제하시겠습니까?`
            : "작성자 이름을 입력해주세요."
        }
        confirmLabel={modalInfo.type === "delete" ? "삭제" : "확인"}
        onConfirm={handleModalConfirm}
      >
        {modalInfo.type !== "delete" && (
          <Input
            value={newAuthorName}
            onChange={(e) => setNewAuthorName(e.target.value)}
            placeholder="작성자 이름"
            className={styles.modalInput}
          />
        )}
      </Modal>
    </div>
  );
};
