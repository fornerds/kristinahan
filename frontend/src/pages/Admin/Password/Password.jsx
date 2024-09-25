import React, { useState } from "react";
import { Button, Input } from "../../../components";
import { TabNavigation } from "../../../modules";
import { useChangePassword, useChangeAdminPassword } from "../../../api/hooks";
import styles from "./Password.module.css";

export const Password = () => {
  const [userPasswords, setUserPasswords] = useState({ old: "", new: "" });
  const [adminPasswords, setAdminPasswords] = useState({ old: "", new: "" });

  const changePasswordMutation = useChangePassword();
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
    changePasswordMutation.mutate(
      {
        oldPassword: userPasswords.old,
        newPassword: userPasswords.new,
      },
      {
        onSuccess: () => {
          alert("직원용 비밀번호가 성공적으로 변경되었습니다.");
          setUserPasswords({ old: "", new: "" });
        },
        onError: (error) => {
          console.error("Password change error:", error);
          alert(
            "비밀번호 변경에 실패했습니다. " +
              (error.response?.data?.detail?.[0]?.msg || "다시 시도해주세요.")
          );
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
          alert("관리자용 비밀번호가 성공적으로 변경되었습니다.");
          setAdminPasswords({ old: "", new: "" });
        },
        onError: () => {
          alert("비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
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
              <Button type="submit" label="수정" />
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
              <Button type="submit" label="수정" />
            </form>
          </section>
        </div>
      </main>
    </div>
  );
};
