import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./Product.module.css";
import {
  useCategoryDetails,
  useUpdateCategory,
  useDeleteCategory,
} from "../../../../api/hooks";

export const Product = () => {
  const { category_id } = useParams();
  const navigate = useNavigate();
  const {
    data: category,
    isLoading,
    isError,
    error,
  } = useCategoryDetails(category_id);
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();

  console.log(category);

  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (category) {
      setCategoryName(category.name);
      setProducts(
        category.products.map((product) => ({
          ...product,
          attributes: product.attributes.map((attr) => attr.value),
        }))
      );
    }
  }, [category]);

  const addProduct = () => {
    setProducts([...products, { name: "", attributes: [], price: 0 }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...products];
    if (field === "price") {
      value = Number(value);
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const addAttribute = (productIndex) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].attributes.push("");
    setProducts(updatedProducts);
  };

  const updateAttribute = (productIndex, attributeIndex, value) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].attributes[attributeIndex] = value;
    setProducts(updatedProducts);
  };

  const removeAttribute = (productIndex, attributeIndex) => {
    const updatedProducts = [...products];
    updatedProducts[productIndex].attributes.splice(attributeIndex, 1);
    setProducts(updatedProducts);
  };

  const handleSave = async () => {
    try {
      const updatedCategory = {
        name: categoryName,
        products: products.map((product) => ({
          name: product.name,
          price: Number(product.price),
          attributes: product.attributes.map((attr) => ({ value: attr })),
        })),
      };

      await updateCategoryMutation.mutateAsync({
        categoryId: Number(category_id), // categoryId를 숫자로 변환
        categoryData: updatedCategory,
      });
      navigate("/admin/product");
    } catch (error) {
      alert("카테고리 수정에 실패했습니다: " + error.message);
    }
  };

  const handleDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategoryMutation.mutateAsync(Number(category_id)); // categoryId를 숫자로 변환
      navigate("/admin/product");
    } catch (error) {
      alert("카테고리 삭제에 실패했습니다: " + error.message);
    }
    setIsDeleteModalOpen(false);
  };

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>에러가 발생했습니다: {error.message}</div>;

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>상품 카테고리 관리</h2>
        {isLoading ? (
          <div>로딩 중...</div>
        ) : isError ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : (
          <>
            <div className={styles.sectionWrap}>
              <section className={styles.section}>
                <label htmlFor="productCategoryName">카테고리명</label>
                <Input
                  id="productCategoryName"
                  type="text"
                  className={styles.input}
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                />
              </section>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>상품목록</h3>
                {products.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>상품명</th>
                        <th>사이즈</th>
                        <th>가격</th>
                        <th>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              className={styles.input}
                              value={product.name}
                              onChange={(e) =>
                                updateProduct(index, "name", e.target.value)
                              }
                            />
                          </td>
                          <td>
                            <div className={styles.attributeContainer}>
                              {product.attributes.map((attr, attrIndex) => (
                                <div
                                  key={attrIndex}
                                  className={styles.attributeItem}
                                >
                                  <Input
                                    type="text"
                                    className={styles.attributeInput}
                                    value={attr}
                                    onChange={(e) =>
                                      updateAttribute(
                                        index,
                                        attrIndex,
                                        e.target.value
                                      )
                                    }
                                  />
                                  <Button
                                    onClick={() =>
                                      removeAttribute(index, attrIndex)
                                    }
                                    className={styles.deleteButton}
                                    variant="danger"
                                  >
                                    <DeleteIcon />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                onClick={() => addAttribute(index)}
                                className={styles.addAttributeButton}
                              >
                                + 사이즈 추가
                              </Button>
                            </div>
                          </td>
                          <td>
                            <p className={styles.priceInputWrap}>
                              <Input
                                type="number"
                                className={styles.priceInput}
                                value={product.price}
                                onChange={(e) =>
                                  updateProduct(index, "price", e.target.value)
                                }
                              />
                              원
                            </p>
                          </td>
                          <td>
                            <Button
                              onClick={() => removeProduct(index)}
                              className={styles.deleteButton}
                              variant="danger"
                            >
                              <DeleteIcon />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className={styles.noCategories}>등록된 상품이 없습니다.</p>
                )}
                <Button
                  onClick={addProduct}
                  className={styles.addButton}
                  label="+ 상품 추가하기"
                />
              </section>
            </div>
            <div className={styles.spacebetween}>
              <Button
                onClick={handleDelete}
                label="삭제"
                className={styles.deleteProductButton}
                variant="danger"
              />
              <div className={styles.buttonGroup}>
                <Link className={styles.cancelLink} to="/admin/product">
                  취소
                </Link>
                <Button
                  onClick={handleSave}
                  className={styles.saveButton}
                  label="저장"
                />
              </div>
            </div>
          </>
        )}
      </main>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="상품 카테고리 삭제"
        message="정말로 해당 상품 카테고리를 삭제하시겠습니까?"
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        cancelLabel="취소"
        onCancel={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
