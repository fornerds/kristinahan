import { TabNavigation } from "../../../modules"
import { ReactComponent as DeleteIcon } from '../../../asset/icon/delete.svg'
import styles from "./WriterList.module.css"
import { useState } from "react";
import { Button } from "../../../components";

export const WriterList = () => {

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    작성자 관리
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
  const [authors, setAuthors] = useState([
    '이범찬', '김유정', '사키코', '윤정은', '김도영', '서다희', '김화언'
  ]);

  const addAuthor = () => {
    const newAuthor = prompt('새 작성자 이름을 입력하세요:');
    if (newAuthor) setAuthors([...authors, newAuthor]);
  };

  const deleteAuthor = (index) => {
    setAuthors(authors.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.tableWrap}>
      <ManagementSection 
        items={authors}
        onAdd={addAuthor}
        onDelete={deleteAuthor}
      />
    </div>
  );
};