import { TabNavigation } from "../../../modules"
import { ReactComponent as DeleteIcon } from '../../../asset/icon/delete.svg'
import styles from "./AffiliationList.module.css"
import { Button } from "../../../components";
import { useState } from "react";

export const AffiliationList = () => {

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    소속 관리
                </h2>
                <UserManagement />
            </main>
        </div>
    )
}

const ManagementSection = ({ items, onAdd, onDelete }) => (
  <div className={styles.managementSection}>
    <table className={styles.table}>
      <thead>
        <tr>
          <th>이름</th>
          <th>삭제</th>
        </tr>
      </thead>
      <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>
              {item}
              </td>
              <td>
                <Button onClick={() => onDelete(index)} className={styles.deleteButton} variant="danger">
                  <DeleteIcon />
                </Button>
              </td>
            </tr>
          ))}
      </tbody>
    </table>
    <Button onClick={onAdd} label="+ 추가하기" className={styles.addButton} />
    <Button onClick={()=>{}} label="저장하기" className={styles.saveButton} />
  </div>
);

export const UserManagement = () => {
  const [affiliations, setAffiliations] = useState([
    '한국-한국', '한국-일본', '한국-국제', '일본-한국', '일본-일본', 
    '일본-국제', '국제-한국', '국제-일본', '국제-국제'
  ]);

  const addAffiliation = () => {
    const newAffiliation = prompt('새 소속을 입력하세요:');
    if (newAffiliation) setAffiliations([...affiliations, newAffiliation]);
  };

  const deleteAffiliation = (index) => {
    setAffiliations(affiliations.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.tableWrap}>
      <ManagementSection 
        items={affiliations}
        onAdd={addAffiliation}
        onDelete={deleteAffiliation}
      />
    </div>
  );
};