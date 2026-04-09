"use client";
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function PasswordField({ label, className, ...props }: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const handleShow = () => setShow(true);
  const handleHide = () => setShow(false);

  return (
    <div style={{ width: "100%" }}>
      {label && <label className="label">{label}</label>}
      <div style={{ position: "relative" }}>
        <input
          {...props}
          type={show ? "text" : "password"}
          className={`input ${className || ""}`}
          style={{ width: "100%", paddingRight: "2.75rem", ...props.style }}
        />
        <button
          type="button"
          onMouseDown={handleShow}
          onMouseUp={handleHide}
          onMouseLeave={handleHide}
          onTouchStart={(e) => { e.preventDefault(); handleShow(); }}
          onTouchEnd={(e) => { e.preventDefault(); handleHide(); }}
          style={{
            position: "absolute",
            right: "0.75rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "var(--text-secondary)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "0.25rem",
            transition: "color 0.2s",
            userSelect: "none",
            WebkitTapHighlightColor: "transparent",
          }}
          title="Press and hold to show password"
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
