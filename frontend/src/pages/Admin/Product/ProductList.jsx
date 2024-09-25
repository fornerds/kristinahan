import React from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "../../../components";
import { TabNavigation } from "../../../modules";
import styles from "./ProductList.module.css";
import { useCategories } from "../../../api/hooks";

export const ProductList = () => {
  const navigate = useNavigate();
  const { data: categories, isLoading, isError, error } = useCategories();

  const handleRowClick = (id) => {
    navigate(`/admin/product/${id}`);
  };

  const formatProductNames = (products) => {
    return products.map((product) => product.name).join(", ");
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>카테고리(상품) 관리</h2>
        <section className={styles.section}>
          <div className={styles.actionButtonsWrap}>
            <Link to="/admin/product/create" className={styles.newProduct}>
              + 카테고리 추가하기
            </Link>
          </div>

          {isLoading ? (
            <div>로딩 중...</div>
          ) : isError ? (
            error?.response?.status === 404 ||
            !categories ||
            categories.length === 0 ? (
              <div>아직 생성된 카테고리가 없습니다.</div>
            ) : (
              <div>에러가 발생했습니다.</div>
            )
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>카테고리</th>
                  <th>상품 정보</th>
                  {/* <th>생성일</th> */}
                </tr>
              </thead>
              <tbody>
                {categories?.data.map((category) => (
                  <tr
                    key={category.id}
                    onClick={() => handleRowClick(category.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{category.name}</td>
                    <td>{formatProductNames(category.products)}</td>
                    {/* <td>
                      {new Date(category.created_at).toLocaleDateString()}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
};
