import "./Signup.css"
import { useState } from 'react'
interface SignupProps {
    onClose: () => void;
    onSwitchToLogin: () => void;
}
const Signup: React.FC<SignupProps> = ({ onClose, onSwitchToLogin }) => {
    const [email, setEmail] = useState("");
    return (
        <div className="modal-backdrop">
            
            <div className="signup-container">
                <button className='close-btn' onClick={onClose}>X</button>
                <div className="signup-content">
                    <h1 className="login-title ">Sign Up</h1>
                    <input className="account-fields" type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value) }/>
                    <div className='signup-end-container'>
                        <button className='black-rounded-btn'>Continue</button>
                        <p>Already have an account? <span className="blue-span" onClick={onSwitchToLogin}>Login</span></p>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default Signup;