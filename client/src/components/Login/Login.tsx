import "./Login.css";
import { useState } from "react";
import { useAuth } from "../../services/AuthContext";

interface LoginProps {
    onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onClose }) => {
    const { login, setPlayerName } = useAuth(); 
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await fetch(/*"http://localhost:5001/login"*/ "https://ratemywarrioroflight-api.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                setLoading(false);
                return;
            }

            // alert("Login successful!");
            login(); 
            setPlayerName(username);

            onClose();
        } catch (error) {
            console.error("Login error:", error);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };


    return (
        <div className="modal-backdrop">
            <div className="login-container">
                <button className="close-btn" onClick={onClose}>X</button>
                <div className="login-content">
                    <h1 className="login-title bolded-text">Login</h1>
                    <input type="text" className="account-fields" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="password" className="account-fields" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button className="black-rounded-btn" onClick={handleLogin} disabled={loading} >
                        {loading ? "Loading..." : "Continue"}
                    </button>
                    <p>
                        Don't have an account?{" "}
                        <span className="blue-span" onClick={onClose}>
                            Sign Up
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
