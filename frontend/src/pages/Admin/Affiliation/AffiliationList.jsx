import React from "react";
import { TabNavigation } from "../../../modules";
import { ReactComponent as DeleteIcon } from "../../../asset/icon/delete.svg";
import { ReactComponent as EditIcon } from "../../../asset/icon/order_form.svg";
import { Button } from "../../../components";
import styles from "./AffiliationList.module.css";
import {
  useAffiliations,
  useCreateAffiliation,
  useUpdateAffiliation,
  useDeleteAffiliation,
} from "../../../api/hooks";

export const AffiliationList = () => {
  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>소속 관리</h2>
        <AffiliationManagement />
      </main>
    </div>
  );
};

const AffiliationManagement = () => {
  const { data: affiliations, isLoading, isError } = useAffiliations();
  const createAffiliationMutation = useCreateAffiliation();
  const updateAffiliationMutation = useUpdateAffiliation();
  const deleteAffiliationMutation = useDeleteAffiliation();

  const handleAddAffiliation = () => {
    const name = prompt("새 소속 이름을 입력하세요:");
    if (name) {
      createAffiliationMutation.mutate({ name });
    }
  };

  const handleUpdateAffiliation = (affiliation) => {
    const newName = prompt("새 이름을 입력하세요:", affiliation.name);
    if (newName && newName !== affiliation.name) {
      updateAffiliationMutation.mutate({
        affiliationId: affiliation.id,
        name: newName,
      });
    }
  };

  const handleDeleteAffiliation = (affiliationId) => {
    if (window.confirm("정말로 이 소속을 삭제하시겠습니까?")) {
      deleteAffiliationMutation.mutate(affiliationId);
    }
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

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
            {affiliations?.data.map((affiliation) => (
              <tr key={affiliation.id}>
                <td>{affiliation.name}</td>
                <td>
                  <Button
                    onClick={() => handleUpdateAffiliation(affiliation)}
                    className={styles.editButton}
                    aria-label="수정"
                  >
                    <EditIcon fill="white" />
                  </Button>
                </td>
                <td>
                  <Button
                    onClick={() => handleDeleteAffiliation(affiliation.id)}
                    className={styles.deleteButton}
                    aria-label="삭제"
                    variant="danger"
                  >
                    <DeleteIcon />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Button
          onClick={handleAddAffiliation}
          label="+ 추가하기"
          className={styles.addButton}
        />
      </div>
    </div>
  );
};
