import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./Create.module.css";
import { useCategories, useCreateForm } from "../../../../api/hooks";

export const Create = () => {
  const navigate = useNavigate();
  const { data: categoriesData, isLoading, isError, error } = useCategories();
  const createFormMutation = useCreateForm();

  const [formName, setFormName] = useState("");
  const [formNameError, setFormNameError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState({
    자켓소매: "CM",
    자켓길이: "CM",
    자켓폼: "CM",
    바지둘레: "CM",
    바지길이: "CM",
    셔츠목: "CM",
    셔츠소매: "CM",
    드레스등폼: "CM",
    드레스길이: "CM",
  });

  const measurementUnitMapping = {
    자켓소매: "jacketSleeve",
    자켓길이: "jacketLength",
    자켓폼: "jacketForm",
    바지둘레: "pantsCircumference",
    바지길이: "pantsLength",
    셔츠목: "shirtNeck",
    셔츠소매: "shirtSleeve",
    드레스등폼: "dressBackForm",
    드레스길이: "dressLength",
  };

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  const categories = categoriesData?.data;

  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      selectedCategories.length === 0
    ) {
      setSelectedCategories([categories[0].id]);
    }
  }, [categories]);

  const addCategory = () => {
    if (categories && categories.length > 0) {
      const newCategoryId = categories.find(
        (cat) => !selectedCategories.includes(cat.id)
      )?.id;
      if (newCategoryId) {
        setSelectedCategories([...selectedCategories, newCategoryId]);
      }
    }
  };

  const removeCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((catId) => catId !== id));
  };

  const handleCategoryChange = (index, value) => {
    const newSelectedCategories = [...selectedCategories];
    newSelectedCategories[index] = Number(value);
    setSelectedCategories(newSelectedCategories);
  };

  const handleMeasurementUnitChange = (field, value) => {
    setMeasurementUnits({ ...measurementUnits, [field]: value });
  };

  const handleFormNameChange = (e) => {
    const value = e.target.value;
    setFormName(value);
    if (value.length === 0) {
      setFormNameError("주문서 양식명은 필수입니다.");
    } else {
      setFormNameError("");
    }
  };

  const validateForm = () => {
    if (formName.length === 0) {
      setFormNameError("주문서 양식명은 필수입니다.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formData = {
        name: formName,
        ...Object.entries(measurementUnits).reduce((acc, [key, value]) => {
          acc[measurementUnitMapping[key]] = value;
          return acc;
        }, {}),
        categories: selectedCategories,
      };
      await createFormMutation.mutateAsync(formData);
      setModalInfo({
        isOpen: true,
        title: "성공",
        message: "주문서 양식이 성공적으로 생성되었습니다.",
      });
    } catch (error) {
      setModalInfo({
        isOpen: true,
        title: "오류",
        message: "주문서 양식 생성에 실패했습니다: " + error.message,
      });
    }
  };

  const closeModal = () => {
    setModalInfo({ isOpen: false, title: "", message: "" });
    if (modalInfo.title === "성공") {
      navigate("/admin/orderform");
    }
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>주문서 양식 생성</h2>

        {isLoading ? (
          <div>로딩 중...</div>
        ) : isError ? (
          <div>에러가 발생했습니다: {error.message}</div>
        ) : categories && categories.length === 0 ? (
          <div>
            아직 생성된 카테고리가 없습니다. 먼저 카테고리(상품)를 생성해주세요.
          </div>
        ) : (
          <>
            <div className={styles.sectionWrap}>
              <section className={styles.section}>
                <label htmlFor="orderFormName">
                  주문서 양식명 <p className={styles.required}>*</p>
                </label>
                <Input
                  name="orderFormName"
                  type="text"
                  className={`${styles.input} ${
                    formNameError ? styles.inputError : ""
                  }`}
                  value={formName}
                  onChange={handleFormNameChange}
                  required
                />
                {formNameError && (
                  <p className={styles.errorMessage}>{formNameError}</p>
                )}
              </section>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>등록된 카테고리</h3>
                {selectedCategories.length > 0 ? (
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>이름</th>
                        <th>삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedCategories.map((categoryId, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={categoryId}
                              onChange={(e) =>
                                handleCategoryChange(index, e.target.value)
                              }
                              className={styles.select}
                            >
                              {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Button
                              onClick={() => removeCategory(categoryId)}
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
                  <p className={styles.noCategories}>
                    등록된 카테고리가 없습니다.
                  </p>
                )}
                <Button
                  onClick={addCategory}
                  label="+ 카테고리 추가하기"
                  className={styles.addButton}
                />
              </section>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>수선정보</h3>
                <div className={styles.sectionGroupWrap}>
                  {Object.entries(measurementUnits).map(([key, value]) => (
                    <div key={key} className={styles.sectionVerticalGroup}>
                      <span className={styles.sectionLabel}>{key}</span>
                      <select
                        value={value}
                        onChange={(e) =>
                          handleMeasurementUnitChange(key, e.target.value)
                        }
                        className={styles.select}
                      >
                        <option value="CM">CM</option>
                        <option value="INCH">INCH</option>
                      </select>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className={styles.buttonGroup}>
              <Link to="/admin/orderform" className={styles.cancelLink}>
                취소
              </Link>
              <Button
                onClick={handleSubmit}
                label="저장"
                className={styles.saveButton}
              />
            </div>
          </>
        )}
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
