import "./Login.css"
import { useState } from 'react'
interface LoginProps {
    onClose: () => void;
    onSwitchToSignUp: () => void;
}
const Login: React.FC<LoginProps> = ({ onClose, onSwitchToSignUp}) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("")
    return (
        <div className="modal-backdrop">
            
            <div className="login-container">
                <button className='close-btn' onClick={onClose}>X</button>
                <div className="login-content">
                    <h1 className="bolded-text">Login</h1>
                    <input type="text" className="account-fields" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value) }/>
                    <input type="password" className="account-fields"  placeholder="Password"  value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button className='black-rounded-btn'>Continue</button>

                    <p>Don't have an account? <span  className="blue-span" onClick={onSwitchToSignUp}>Sign Up</span></p>

                </div>
            </div>
        </div>
    )
}

export default Login;