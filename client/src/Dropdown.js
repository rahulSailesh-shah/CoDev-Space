import React, { useState } from "react";
import "./Dropdown.css";

const Dropdown = ({ options, progLanguage, setProgLanguage }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (option) => {
    toggleDropdown();
    setProgLanguage(option);
  };

  return (
    <div className="dropdown">
      <div className="selected-option" onClick={toggleDropdown}>
        {progLanguage}
      </div>
      {isOpen && (
        <ul className="options">
          {options.map((option, index) => (
            <li key={index} onClick={() => handleOptionClick(option)}>
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Dropdown;
