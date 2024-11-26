import React, { useState } from "react";
import { Button, Input } from "../../../components";
import { TabNavigation } from "../../../modules";
import {
  useChangeUserPassword,
  useChangeAdminPassword,
} from "../../../api/hooks";
import styles from "./Password.module.css";

export const Password = () => {
  const [userPasswords, setUserPasswords] = useState({ old: "", new: "" });
  const [adminPasswords, setAdminPasswords] = useState({ old: "", new: "" });

  const changeUserPasswordMutation = useChangeUserPassword();
  const changeAdminPasswordMutation = useChangeAdminPassword();

  const handlePasswordChange = (type, field) => (e) => {
    const { value } = e.target;
    if (type === "user") {
      setUserPasswords((prev) => ({ ...prev, [field]: value }));
    } else {
      setAdminPasswords((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleUserPasswordSubmit = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId"); // userId를 로컬 스토리지에서 가져옴

    changeUserPasswordMutation.mutate(
      {
        userId,
        oldPassword: userPasswords.old,
        newPassword: userPasswords.new,
      },
      {
        onSuccess: () => {
          setUserPasswords({ old: "", new: "" });
        },
      }
    );
  };

  const handleAdminPasswordSubmit = (e) => {
    e.preventDefault();
    changeAdminPasswordMutation.mutate(
      {
        oldPassword: adminPasswords.old,
        newPassword: adminPasswords.new,
      },
      {
        onSuccess: () => {
          setAdminPasswords({ old: "", new: "" });
        },
      }
    );
  };

  return (
    <div className={styles.adminLayout}>
      <TabNavigation />
      <main className={styles.adminMainWrap}>
        <h2 className={styles.adminTitle}>비밀번호 관리</h2>
        <div className={styles.sectionWrap}>
          <section className={styles.section}>
            <h3>직원용 비밀번호 변경</h3>
            <form onSubmit={handleUserPasswordSubmit} className={styles.form}>
              <div>
                <label htmlFor="userOldPassword">현재 비밀번호</label>
                <Input
                  id="userOldPassword"
                  name="old"
                  type="password"
                  value={userPasswords.old}
                  onChange={handlePasswordChange("user", "old")}
                  className={styles.input}
                  required
                />
              </div>
              <div>
                <label htmlFor="userNewPassword">새 비밀번호</label>
                <Input
                  id="userNewPassword"
                  name="new"
                  type="password"
                  value={userPasswords.new}
                  onChange={handlePasswordChange("user", "new")}
                  className={styles.input}
                  required
                />
              </div>
              <Button
                type="submit"
                label="수정"
                disabled={changeUserPasswordMutation.isLoading}
              />
            </form>
          </section>
          <section className={styles.section}>
            <h3>관리자용 비밀번호 변경</h3>
            <form onSubmit={handleAdminPasswordSubmit} className={styles.form}>
              <div>
                <label htmlFor="adminOldPassword">현재 비밀번호</label>
                <Input
                  id="adminOldPassword"
                  name="old"
                  type="password"
                  value={adminPasswords.old}
                  onChange={handlePasswordChange("admin", "old")}
                  className={styles.input}
                  required
                />
              </div>
              <div>
                <label htmlFor="adminNewPassword">새 비밀번호</label>
                <Input
                  id="adminNewPassword"
                  name="new"
                  type="password"
                  value={adminPasswords.new}
                  onChange={handlePasswordChange("admin", "new")}
                  className={styles.input}
                  required
                />
              </div>
              <Button
                type="submit"
                label="수정"
                disabled={changeAdminPasswordMutation.isLoading}
              />
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};
