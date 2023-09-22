import React from "react";

const Navbar = () => {
  return (
    <nav style={navbarStyle}>
      <div style={logoStyle}>
        <img src="/logo.png" alt="Logo" style={logoImgStyle} />
      </div>
    </nav>
  );
};

const navbarStyle = {
  backgroundColor: "#333",
  color: "#fff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "1.5rem 0 1rem 5rem",
  width: "100%",
};

const logoStyle = {
  marginLeft: "10px", // Adjust the margin as needed
};

const logoImgStyle = {
  height: "30px",
  width: "200px", // Adjust the logo size as needed
  objectFit: "fit",
};

export default Navbar;
