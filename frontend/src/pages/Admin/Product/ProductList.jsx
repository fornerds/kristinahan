import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Link } from "../../../components";
import { TabNavigation } from "../../../modules";
import styles from "./ProductList.module.css";

const documents = [
    {
      id: 1,
      category: '턱시도 자켓',
      products: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2021-08-02'
    },
    {
      id: 2,
      category: '남자 팬츠',
      products: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2022-10-24'
    },
    {
      id: 3,
      category: '남자 셔츠',
      products: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2023-04-29'
    },
    {
      id: 4,
      category: '드레스',
      products: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2024-09-22'
    },
    {
      id: 5,
      category: '남자 반지',
      products: '턱시도 자켓, 남자 팬츠, 남자 셔츠, 드레스, 남자 반지, 여자 반지, 목걸이, 귀걸이',
      date: '2025-05-26'
    }
];

export const ProductList = () => {
    const navigate = useNavigate();

    const handleRowClick = (id) => {
        navigate(`/admin/product/${id}`);
    };

    return (
        <div className={styles.adminLayout}>
            <TabNavigation />
            <main className={styles.adminMainWrap}>
                <h2 className={styles.adminTitle}>
                    상품 관리
                </h2>
                <section className={styles.section}>
                    <div className={styles.actionButtonsWrap}>
                        <Link to="/admin/product/create" className={styles.newProduct}>+ 카테고리 추가하기</Link>
                    </div>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>카테고리</th>
                                <th>상품 정보</th>
                                <th>생성일</th>
                            </tr>
                        </thead>
                        <tbody>
                        {documents.map((doc) => (
                            <tr key={doc.id} onClick={() => handleRowClick(doc.id)} style={{cursor: 'pointer'}}>
                                <td>{doc.category}</td>
                                <td>{doc.products}</td>
                                <td>{doc.date}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};