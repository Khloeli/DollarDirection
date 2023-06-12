// File to contain 'Welcome' page items
import { Link } from "react-router-dom";
import NavBar from "./NavBar";
import "../App.css";

export default function Welcome() {
  return (
    <div>
      <NavBar />
      <div className="temporary-box">
        <div>
          Welcome to DollarDirection - the app that keeps track of where you've
          been and how much you've spent so you will never have to ask{" "}
          <b>
            <em>"Where'd my money go?!"</em>
          </b>{" "}
          <br />
          <br />
          <Link to="/authForm">Sign Up / Log In here</Link>
        </div>
      </div>
    </div>
  );
}