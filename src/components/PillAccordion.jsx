// src/components/PillAccordion.jsx
import React, { useState } from "react";

const PillAccordion = ({ items = [] }) => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <ul className="accordion">
      {items.map((it, i) => {
        const isOpen = openIndex === i;
        return (
          <li key={i} className={`acc-item ${isOpen ? "open" : ""}`}>
            <button
              className="acc-trigger"
              aria-expanded={isOpen}
              aria-controls={`acc-panel-${i}`}
              id={`acc-btn-${i}`}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            >
              <span className="acc-icon" aria-hidden="true" />
              {it.title}
            </button>

            {isOpen && (
              <div
                className="acc-panel"
                id={`acc-panel-${i}`}
                role="region"
                aria-labelledby={`acc-btn-${i}`}
              >
                <div className="acc-content">{it.content}</div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
};

export default PillAccordion;