import React, { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { TabNavigation, Modal } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./Create.module.css";
import { useCreateCategory } from "../../../../api/hooks";

const ProductRow = memo(
  ({
    product,
    index,
    updateProduct,
    removeProduct,
    addAttribute,
    updateAttribute,
    removeAttribute,
  }) => (
    <tr>
      <td>
        <Input
          type="text"
          className={styles.input}
          value={product.name}
          onChange={(e) => updateProduct(index, "name", e.target.value)}
        />
      </td>
      <td>
        <div className={styles.attributeContainer}>
          {product.attributes.map((attr, attrIndex) => (
            <div key={attrIndex} className={styles.attributeItem}>
              <Input
                type="text"
                className={styles.attributeInput}
                value={attr.value}
                onChange={(e) =>
                  updateAttribute(index, attrIndex, e.target.value)
                }
                placeholder="사이즈"
              />
              <Button
                onClick={() => removeAttribute(index, attrIndex)}
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
        <div className={styles.priceInputWrap}>
          <Input
            type="number"
            className={styles.priceInput}
            value={product.price}
            onChange={(e) => updateProduct(index, "price", e.target.value)}
          />
          원
        </div>
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
  )
);

export const Create = () => {
  const navigate = useNavigate();
  const createCategoryMutation = useCreateCategory();
  const [categoryName, setCategoryName] = useState("");
  const [categoryNameError, setCategoryNameError] = useState("");
  const [products, setProducts] = useState([]);
  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const validateCategoryName = useCallback((name) => {
    if (name.trim().length === 0) {
      setCategoryNameError("카테고리명은 필수입니다.");
      return false;
    }
    setCategoryNameError("");
    return true;
  }, []);

  const handleCategoryNameChange = useCallback(
    (e) => {
      const name = e.target.value;
      setCategoryName(name);
      validateCategoryName(name);
    },
    [validateCategoryName]
  );

  const addProduct = useCallback(() => {
    setProducts((prevProducts) => [
      ...prevProducts,
      { name: "", price: 0, attributes: [] },
    ]);
  }, []);

  const removeProduct = useCallback((index) => {
    setProducts((prevProducts) => prevProducts.filter((_, i) => i !== index));
  }, []);

  const updateProduct = useCallback((index, field, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      if (field === "price") {
        value = parseFloat(value) || 0;
      }
      updatedProducts[index] = { ...updatedProducts[index], [field]: value };
      return updatedProducts;
    });
  }, []);

  const addAttribute = useCallback((productIndex) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        attributes: [
          ...updatedProducts[productIndex].attributes,
          { value: "" },
        ],
      };
      return updatedProducts;
    });
  }, []);

  const updateAttribute = useCallback((productIndex, attributeIndex, value) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        attributes: updatedProducts[productIndex].attributes.map(
          (attr, index) =>
            index === attributeIndex ? { ...attr, value } : attr
        ),
      };
      return updatedProducts;
    });
  }, []);

  const removeAttribute = useCallback((productIndex, attributeIndex) => {
    setProducts((prevProducts) => {
      const updatedProducts = [...prevProducts];
      updatedProducts[productIndex] = {
        ...updatedProducts[productIndex],
        attributes: updatedProducts[productIndex].attributes.filter(
          (_, index) => index !== attributeIndex
        ),
      };
      return updatedProducts;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateCategoryName(categoryName)) {
        return;
      }

      try {
        const categoryData = {
          name: categoryName.trim(),
          products: products.map((product) => ({
            name: product.name.trim(),
            price: Number(product.price),
            attributes: product.attributes.map((attr) => ({
              value: attr.value.trim(),
            })),
          })),
        };

        await createCategoryMutation.mutateAsync(categoryData);
        navigate("/admin/product");
      } catch (error) {
        setModalInfo({
          isOpen: true,
          title: "오류",
          message: "카테고리 생성에 실패했습니다: " + error.message,
        });
      }
    },
    [
      categoryName,
      products,
      createCategoryMutation,
      validateCategoryName,
      navigate,
    ]
  );

  const closeModal = useCallback(() => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/product");
    }
  }, [modalInfo.title, navigate]);

  const isSubmitDisabled = categoryName.trim().length === 0;

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>상품 카테고리 생성</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.sectionWrap}>
            <section className={styles.section}>
              <label htmlFor="productCategoryName">
                카테고리명 <p className={styles.required}>*</p>
              </label>
              <Input
                id="productCategoryName"
                type="text"
                className={`${styles.input} ${
                  categoryNameError ? styles.inputError : ""
                }`}
                value={categoryName}
                onChange={handleCategoryNameChange}
                required
              />
              {categoryNameError && (
                <p className={styles.errorMessage}>{categoryNameError}</p>
              )}
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
                      <ProductRow
                        key={index}
                        product={product}
                        index={index}
                        updateProduct={updateProduct}
                        removeProduct={removeProduct}
                        addAttribute={addAttribute}
                        updateAttribute={updateAttribute}
                        removeAttribute={removeAttribute}
                      />
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
              type="submit"
              className={styles.saveButton}
              label="저장"
              disabled={isSubmitDisabled}
            />
          </div>
        </form>
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
