import React, { useState, forwardRef } from "react";
import PropTypes from "prop-types";
import styles from "./Input.module.css";

export const Input = forwardRef(
  (
    { type, placeholder, onChange, value, mode, style, error, className, onKeyDown },
    ref
  ) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = (e) => {
      e.preventDefault();
      setPasswordVisible((prevVisible) => !prevVisible);
    };

    const inputType =
      type === "password" ? (passwordVisible ? "text" : "password") : type;

    return (
      <div className={`${styles['input-container']}`} style={{width: '100%', ...style}}>
        <input
          ref={ref}
          type={inputType}
          className={`${styles.input} ${styles[`input--${mode}`]} ${className}`}
          placeholder={placeholder}
          onChange={onChange}
          value={value}
          onKeyDown={onKeyDown}
        />
        {type === "password" && (
          <button
            type="button"
            className={styles['toggle-password-button']}
            onClick={togglePasswordVisibility}
          >
            {passwordVisible ? (
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.37695 8.42295C2.37695 8.42295 4.77695 4.02295 8.37695 4.02295C11.977 4.02295 14.377 8.42295 14.377 8.42295C14.377 8.42295 11.977 12.8229 8.37695 12.8229C4.77695 12.8229 2.37695 8.42295 2.37695 8.42295Z"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.97656 8.42295C5.97656 7.09735 7.05096 6.02295 8.37656 6.02295"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.777 8.42285C10.777 9.74845 9.70255 10.8229 8.37695 10.8229"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="8.5"
                  cy="8"
                  r="2"
                  fill="none"
                  stroke="#171A1F"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <svg
                width="17"
                height="17"
                viewBox="0 0 17 17"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.37695 8.42295C2.37695 8.42295 4.77695 4.02295 8.37695 4.02295C11.977 4.02295 14.377 8.42295 14.377 8.42295C14.377 8.42295 11.977 12.8229 8.37695 12.8229C4.77695 12.8229 2.37695 8.42295 2.37695 8.42295Z"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.97656 8.42295C5.97656 7.09735 7.05096 6.02295 8.37656 6.02295"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10.777 8.42285C10.777 9.74845 9.70255 10.8229 8.37695 10.8229"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2.77734 14.0228L13.9773 2.82275"
                  stroke="#171A1F"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
        {error && <p className={styles['input-error-message']}>{error}</p>}
      </div>
    );
  }
);

Input.propTypes = {
  type: PropTypes.oneOf(["name", "text", "password", "email", "tel"]),
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onKeyDown: PropTypes.func,
  mode: PropTypes.oneOf(["default", "dark", "underline"]),
  value: PropTypes.string,
  style: PropTypes.object,
  error: PropTypes.string,
  className: PropTypes.string,
};

Input.defaultProps = {
  type: "text",
  placeholder: "",
  onChange: () => {},
  onKeyDown: () => {},
  mode: "default",
};