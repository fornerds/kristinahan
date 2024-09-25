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
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [measurementUnits, setMeasurementUnits] = useState({
    자켓소매: "inch",
    자켓길이: "inch",
    자켓폼: "inch",
    바지둘레: "inch",
    바지길이: "inch",
    셔츠목: "inch",
    셔츠소매: "inch",
    드레스등폼: "inch",
    드레스길이: "inch",
  });
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
      setSelectedCategories([
        {
          id: Date.now(),
          categoryId: categories[0].id,
          name: categories[0].name,
        },
      ]);
    }
  }, [categories]);

  const addCategory = () => {
    if (categories && categories.length > 0) {
      const newCategory = {
        id: Date.now(),
        categoryId: categories[0].id,
      };
      setSelectedCategories([...selectedCategories, newCategory]);
    }
  };

  const removeCategory = (id) => {
    setSelectedCategories(selectedCategories.filter((cat) => cat.id !== id));
  };

  const handleCategoryChange = (id, value) => {
    setSelectedCategories(
      selectedCategories.map((cat) =>
        cat.id === id ? { ...cat, categoryId: Number(value) } : cat
      )
    );
  };

  const handleMeasurementUnitChange = (field, value) => {
    setMeasurementUnits({ ...measurementUnits, [field]: value });
  };

  const handleSubmit = async () => {
    try {
      const formData = {
        name: formName,
        jacketSleeve: measurementUnits.자켓소매,
        jacketLength: measurementUnits.자켓길이,
        jacketForm: measurementUnits.자켓폼,
        pantsCircumference: measurementUnits.바지둘레,
        pantsLength: measurementUnits.바지길이,
        shirtNeck: measurementUnits.셔츠목,
        shirtSleeve: measurementUnits.셔츠소매,
        dressBackForm: measurementUnits.드레스등폼,
        dressLength: measurementUnits.드레스길이,
        categories: selectedCategories.map((cat) => cat.categoryId),
      };
      // console.log(formData);
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
                <label htmlFor="orderFormName">주문서 양식명</label>
                <Input
                  name="orderFormName"
                  type="text"
                  className={styles.input}
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
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
                      {selectedCategories.map((selectedCat) => (
                        <tr key={selectedCat.id}>
                          <td>
                            <select
                              value={selectedCat.categoryId}
                              onChange={(e) =>
                                handleCategoryChange(
                                  selectedCat.id,
                                  e.target.value
                                )
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
                              onClick={() => removeCategory(selectedCat.id)}
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
                        <option value="inch">inch</option>
                        <option value="cm">cm</option>
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
