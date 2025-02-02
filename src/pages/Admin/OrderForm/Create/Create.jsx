import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Input, Link } from "../../../../components";
import { Modal, TabNavigation } from "../../../../modules";
import { ReactComponent as DeleteIcon } from "../../../../asset/icon/delete.svg";
import styles from "./Create.module.css";
import { useCategories, useCreateForm } from "../../../../api/hooks";

export const Create = () => {
  const navigate = useNavigate();
  const { data: allCategories, isLoading, isError, error } = useCategories();
  const createFormMutation = useCreateForm();

  const [formName, setFormName] = useState("");
  const [formNameError, setFormNameError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [repairs, setRepairs] = useState([]);

  const [modalInfo, setModalInfo] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  useEffect(() => {
    if (allCategories?.length > 0 && selectedCategories.length === 0) {
      setSelectedCategories([
        {
          id: allCategories[0].id,
          name: allCategories[0].name,
        },
      ]);
    }
  }, [allCategories]);

  const addRepair = () => {
    setRepairs([
      ...repairs,
      {
        information: "",
        unit: "cm",
        standards: "",
        isAlterable: true,
      },
    ]);
  };

  const removeRepair = (index) => {
    setRepairs(repairs.filter((_, i) => i !== index));
  };

  const updateRepair = (index, field, value) => {
    const updatedRepairs = [...repairs];
    updatedRepairs[index] = {
      ...updatedRepairs[index],
      [field]: value,
    };
    setRepairs(updatedRepairs);
  };

  const addCategory = () => {
    if (!allCategories?.length) return;

    const selectedIds = new Set(
      selectedCategories.map((cat) => Number(cat.id))
    );
    const availableCategories = allCategories.filter(
      (cat) => !selectedIds.has(Number(cat.id))
    );

    if (availableCategories.length > 0) {
      const categoryToAdd = availableCategories[0];
      setSelectedCategories([
        ...selectedCategories,
        {
          id: Number(categoryToAdd.id),
          name: categoryToAdd.name,
        },
      ]);
    } else {
      setModalInfo({
        isOpen: true,
        title: "알림",
        message: "추가할 수 있는 카테고리가 없습니다.",
      });
    }
  };

  const removeCategory = (index) => {
    setSelectedCategories(selectedCategories.filter((_, i) => i !== index));
  };

  const handleCategoryChange = (index, newCategoryId) => {
    const newCategory = allCategories.find(
      (cat) => cat.id === Number(newCategoryId)
    );
    if (newCategory) {
      const updatedCategories = [...selectedCategories];
      updatedCategories[index] = {
        id: Number(newCategory.id),
        name: newCategory.name,
      };
      setSelectedCategories(updatedCategories);
    }
  };

  const validateForm = () => {
    if (formName.length === 0) {
      setFormNameError("주문서 양식명은 필수입니다.");
      return false;
    }
    if (repairs.length === 0) {
      setModalInfo({
        isOpen: true,
        title: "알림",
        message: "최소 하나의 수선 정보가 필요합니다.",
      });
      return false;
    }
    for (const repair of repairs) {
      if (!repair.information || !repair.standards) {
        setModalInfo({
          isOpen: true,
          title: "알림",
          message: "모든 수선 정보를 입력해주세요.",
        });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const cleanedRepairs = repairs.map(({ id, indexNumber, ...repair }) => ({
        ...repair,
        isAlterable: Boolean(repair.isAlterable),
        standards: repair.standards || null,
      }));

      const categoryIds = selectedCategories.map((category) =>
        typeof category.id === "string"
          ? parseInt(category.id, 10)
          : category.id
      );

      const formData = {
        name: formName,
        repairs: cleanedRepairs,
        categories: categoryIds,
      };

      await createFormMutation.mutateAsync(formData);
      navigate("/admin/orderform");
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
        ) : allCategories?.length === 0 ? (
          <div>
            아직 생성된 카테고리가 없습니다. 먼저 카테고리(상품)를 생성해주세요.
          </div>
        ) : (
          <>
            <div className={styles.sectionWrap}>
              <section className={styles.section}>
                <label htmlFor="orderFormName">
                  주문서 양식명 <span className={styles.required}>*</span>
                </label>
                <Input
                  name="orderFormName"
                  type="text"
                  className={`${styles.input} ${
                    formNameError ? styles.inputError : ""
                  }`}
                  value={formName}
                  onChange={(e) => {
                    setFormName(e.target.value);
                    setFormNameError("");
                  }}
                />
                {formNameError && (
                  <p className={styles.errorMessage}>{formNameError}</p>
                )}
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>수선 정보</h3>
                {repairs.map((repair, index) => (
                  <div key={index} className={styles.repairItem}>
                    <div className={styles.repairContent}>
                      <div className={styles.repairField}>
                        <Input
                          type="text"
                          placeholder="수선 정보"
                          value={repair.information}
                          onChange={(e) =>
                            updateRepair(index, "information", e.target.value)
                          }
                          className={styles.input}
                        />
                      </div>

                      <div className={styles.repairRow}>
                        <div className={styles.repairField}>
                          <label>단위</label>
                          <select
                            value={repair.unit}
                            onChange={(e) =>
                              updateRepair(index, "unit", e.target.value)
                            }
                            className={styles.select}
                          >
                            <option value="cm">cm</option>
                            <option value="inch">inch</option>
                          </select>
                        </div>

                        <div className={styles.repairField}>
                          <label>기준값</label>
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            value={repair.standards}
                            onChange={(e) =>
                              updateRepair(index, "standards", e.target.value)
                            }
                            className={styles.input}
                          />
                        </div>
                      </div>

                      <div className={styles.repairField}>
                        <label className={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={repair.isAlterable}
                            onChange={(e) =>
                              updateRepair(
                                index,
                                "isAlterable",
                                e.target.checked
                              )
                            }
                            className={styles.checkbox}
                          />
                          수선 가능 여부
                        </label>
                      </div>
                    </div>

                    <Button
                      onClick={() => removeRepair(index)}
                      className={styles.deleteButton}
                      variant="danger"
                    >
                      <DeleteIcon />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={addRepair}
                  label="+ 수선 정보 추가"
                  className={styles.addButton}
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
                      {selectedCategories.map((category, index) => (
                        <tr key={index}>
                          <td>
                            <select
                              value={category.id}
                              onChange={(e) =>
                                handleCategoryChange(index, e.target.value)
                              }
                              className={styles.select}
                            >
                              {allCategories?.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                  {cat.name}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <Button
                              onClick={() => removeCategory(index)}
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
            </div>

            <div className={styles.spacebetween}>
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
