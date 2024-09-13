import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Link } from "../../../components";
import { TabNavigation } from "../../../modules";
import styles from "./OrderFormList.module.css";

const documents = [
    {
      id: 1,
      name: '2021 행사',
      category: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2021-08-02'
    },
    {
      id: 2,
      name: '2022 행사',
      category: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2022-10-24'
    },
    {
      id: 3,
      name: '2023 행사',
      category: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2023-04-29'
    },
    {
      id: 4,
      name: '2024 행사',
      category: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2024-09-22'
    },
    {
      id: 5,
      name: '2025 행사',
      category: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2025-05-26'
    }
];

export const OrderFormList = () => {
    const navigate = useNavigate();

    const handleRowClick = (id) => {
        navigate(`/admin/orderform/${id}`);
    };

    const handleCopyClick = (e, id) => {
        e.stopPropagation(); // 이벤트 버블링 방지
        // 여기에 복제 로직을 구현합니다.
        console.log(`복제 버튼 클릭: ${id}`);
    };

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    주문서 양식 관리
                </h2>
                <section className={styles.section}>
                    <div className={styles.actionButtonsWrap}>
                        <Link to="/admin/orderform/create" className={styles.newOrderForm}>+ 주문서양식 추가하기</Link>
                    </div>
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
                        {documents.map((doc) => (
                            <tr key={doc.id} onClick={() => handleRowClick(doc.id)} style={{cursor: 'pointer'}}>
                                <td>{doc.name}</td>
                                <td>{doc.category}</td>
                                <td>{doc.date}</td>
                                <td>
                                    <Button 
                                        onClick={(e) => handleCopyClick(e, doc.id)} 
                                        label="복제" 
                                        className={styles.copyButton} 
                                    />
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};