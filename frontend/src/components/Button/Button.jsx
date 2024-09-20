import React from "react";
import PropTypes from "prop-types";
import styles from "./Button.module.css";

export const Button = ({
  variant = "default",
  size = "md",
  backgroundColor,
  label,
  onClick = () => {},
  children,
  style,
  className,
  disabled = false,
  type = "button",
}) => {
  const buttonClassName = [
    styles.button,
    styles[`button--${size}`],
    styles[`button--${variant}`],
    className
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type={type}
      className={buttonClassName}
      disabled={disabled}
      style={{ backgroundColor, ...style }}
      onClick={onClick}
    >
      {children && <span className={styles["button-icon"]}>{children}</span>}
      {label}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf([
    "default",
    "danger",
    "primary",
    "secondary",
    "cancel",
  ]),
  backgroundColor: PropTypes.string,
  size: PropTypes.oneOf(["2xs", "xs", "sm", "md", "lg", "full"]),
  label: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  style: PropTypes.object,
  className: PropTypes.string,
  type: PropTypes.string,
};