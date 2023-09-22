import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./Home.css";

const Home = () => {
  const [room, setRoom] = useState("");

  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">CoDev Space</h1>
        <div>
          <input
            placeholder="Room ID"
            className="joinInput mt-20"
            type="text"
            onChange={(event) => setRoom(event.target.value)}
          />
        </div>
        <Link
          onClick={(e) => (!room ? e.preventDefault() : null)}
          to={`/codev?room=${room}`}
        >
          <button className={"join-button mt-20"} type="submit">
            Join
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Home;
