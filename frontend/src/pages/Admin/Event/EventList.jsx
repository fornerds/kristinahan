import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "../../../components"
import { TabNavigation } from "../../../modules"
import styles from "./EventList.module.css"

const initialDocuments = [
    {
      id: 1,
      title: '2021년 행사',
      orderform: '2021년 행사 주문서',
      start: '2021-08-02',
      end: '2021-09-02',
      isPublishing: false
    },
    {
      id: 2,
      title: '2022년 행사',
      orderform: '2022년 행사 주문서',
      start: '2022-10-24',
      end: '2022-11-02',
      isPublishing: false
    },
    {
      id: 3,
      title: '2023년 행사',
      orderform: '2023년 행사 주문서',
      start: '2023-04-29',
      end: '2023-08-02',
      isPublishing: false
    },
    {
      id: 4,
      title: '2024년 행사',
      orderform: '2024년 행사 주문서',
      start: '2024-09-02',
      end: '2024-10-02',
      isPublishing: true
    },
    {
      id: 5,
      title: '2025년 행사',
      orderform: '2025년 행사 주문서',
      start: '2025-05-26',
      end: '2025-08-02',
      isPublishing: false
    }
];

export const EventList = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState(initialDocuments);

    const handleRowClick = (id) => {
        navigate(`/admin/event/${id}`);
    };

    const handleSwitchClick = (e, id) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        setDocuments(prevDocuments =>
            prevDocuments.map(doc =>
                doc.id === id ? { ...doc, isPublishing: !doc.isPublishing } : doc
            )
        );
    };

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    행사 관리
                </h2>
                <section className={styles.section}>
                    <div className={styles.actionButtonsWrap}>
                        <Link to="/admin/event/create" className={styles.newEvent}>+ 행사 추가하기</Link>
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
                        {documents.map((doc) => (
                            <tr key={doc.id} onClick={() => handleRowClick(doc.id)} style={{cursor: 'pointer'}}>
                                <td>{doc.title}</td>
                                <td>{doc.orderform}</td>
                                <td>{doc.start}</td>
                                <td>{doc.end}</td>
                                <td>
                                    <label className={styles.switch} onClick={(e)=>handleSwitchClick(e, doc.id)}>
                                        <input type="checkbox" checked={doc.isPublishing} readOnly />
                                        <span className={styles.slider}></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    )
}
