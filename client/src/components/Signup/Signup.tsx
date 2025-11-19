import "./Signup.css";
import { useState } from "react";

interface SignupProps {
    onClose: () => void;
}

const Signup: React.FC<SignupProps> = ({ onClose }) => {
    const [user, setUser] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            setLoading(true);
            const response = await fetch("http://localhost:5001/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: user,
                    password: password,
                    confirm_password: confirmPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.error);
                setLoading(false);
                return;
            }

            alert("Signup successful! You can now log in.");
            onClose();
        } catch (error) {
            console.error("Signup error:", error);
            alert("Something went wrong. Please try again.");
            setLoading(false);
        }
    };

    return (
        <div className="modal-backdrop">
            <div className="signup-container">
                <button className="close-btn" onClick={onClose}>X</button>
                <div className="signup-content">
                    <h1 className="signup-title">Sign Up</h1>
                    <input className="account-fields" type="text" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)}/>
                    <input className="account-fields" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <input className="account-fields" type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}/>
                    <button className="black-rounded-btn" onClick={handleSignup} disabled={loading}>
                        {loading ? "Loading..." : "Continue"}
                    </button>
                    <p>
                        Already have an account?{" "}
                        <span className="blue-span" onClick={onClose}>
                            Login
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Signup;
