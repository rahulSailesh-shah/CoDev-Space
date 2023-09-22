import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import TextEditor from "./TextEditor";
import Home from "./Home";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" exact element={<Home />}></Route>
        <Route path="/codev" element={<TextEditor />} />
      </Routes>
    </Router>
  );
};

export default App;
