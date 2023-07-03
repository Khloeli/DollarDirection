import { Link, useNavigate } from "react-router-dom";
import "../App.css";

export default function Welcome({ isLoggedIn }) {
  const navigate = useNavigate();
  return (
    <div className="welcome-container">
      {isLoggedIn ? (
        navigate("/mapexpenses")
      ) : (
        <div>
          <h1>Welcome to DollarDirection!</h1>
          <br />
          <p>
            Keep track of where you've been and how much you've spent so you
            will never have to ask: <br />
            <b>
              <em>"Where'd my money go?!"</em>
            </b>
          </p>{" "}
          <Link to="/authform">Sign Up / Log In here</Link>
        </div>
      )}
    </div>
  );
}
