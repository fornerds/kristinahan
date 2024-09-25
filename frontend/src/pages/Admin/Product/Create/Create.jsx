import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { TabNavigation, Modal } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./Create.module.css";
import { useCreateCategory } from "../../../../api/hooks";

export const Create = () => {
  const navigate = useNavigate();
  const createCategoryMutation = useCreateCategory();
  const [categoryName, setCategoryName] = useState("");
  const [products, setProducts] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const addProduct = () => {
    setProducts([...products, { name: "", price: 0, attributes: [] }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updatedProducts = [...products];
    if (field === "price") {
      value = parseFloat(value) || 0;
    }
    updatedProducts[index] = { ...updatedProducts[index], [field]: value };
    setProducts(updatedProducts);
  };

  const addAttribute = (productIndex) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      if (!updatedProducts[productIndex].attributes) {
        updatedProducts[productIndex].attributes = [];
      }
      updatedProducts[productIndex].attributes.push({ value: "" });
      return updatedProducts;
    });
  };

  const updateAttribute = (productIndex, attributeIndex, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex].attributes[attributeIndex].value = value;
      return updatedProducts;
    });
  };

  const removeAttribute = (productIndex, attributeIndex) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex].attributes.splice(attributeIndex, 1);
      return updatedProducts;
    });
  };

  const handleSubmit = async () => {
    try {
      const categoryData = {
        name: categoryName,
        products: products.map((product) => ({
          name: product.name,
          price: product.price,
          attributes: product.attributes || [],
        })),
      };

      await createCategoryMutation.mutateAsync(categoryData);
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "카테고리가 성공적으로 생성되었습니다.",
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "카테고리 생성에 실패했습니다: " + error.message,
      });
    }
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/product");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>상품 카테고리 생성</h2>
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
            {products && products.length > 0 ? (
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
                          {product.attributes &&
                            product.attributes.map((attr, attrIndex) => (
                              <div
                                key={attrIndex}
                                className={styles.attributeItem}
                              >
                                <Input
                                  type="text"
                                  className={styles.attributeInput}
                                  value={attr.value}
                                  onChange={(e) =>
                                    updateAttribute(
                                      index,
                                      attrIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="사이즈"
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
        <div className={styles.buttonGroup}>
          <Link className={styles.cancelLink} to="/admin/product">
            취소
          </Link>
          <Button
            onClick={handleSubmit}
            className={styles.saveButton}
            label="저장"
          />
        </div>
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
