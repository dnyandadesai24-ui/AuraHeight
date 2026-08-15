import {useState} from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Register(){
    const navigate=useNavigate();

    const [user, setUser] = useState({
        full_name: "",
        username: "",
        email: "",
        mobile: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

    const changeHandler = (e) => {
        const { name, value } = e.target;

        setUser({
            ...user,
            [name]: value
        });
        // keypress validation

        let error = "";

        if (name === "email") {
            if (!/\S+@\S+\.\S+/.test(value)) {
                error = "Invalid email address";
            }
        }

        if (name === "password") {
            if (value.length < 6) {
                error = "Password should be at least 6 characters";
            }
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };  

    const validate = () => {
        const newErrors = {};

        if (user.full_name.trim() === "") {
            newErrors.full_name = "Name is required";
        }

        if (user.username.trim() === "") {
            newErrors.username = "Username is required";
        }

        if (user.email.trim() === "") {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
            newErrors.email = "Invalid email";
        }

        if (user.mobile.trim() === "") {
            newErrors.mobile = "Mobile number is required";
        }

        if (user.password === "") {
            newErrors.password = "Password is required";
        } else if (user.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) =>{
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            await axios.post("http://localhost:3000/register", user);
            alert("Registration successful");
            navigate("/");
        } catch (error) {
            alert(error.response?.data?.message || "Registration failed");
        }
    };

 
return(

    <div className="container mt-5">

        <h2>Register</h2>

        <form onSubmit={submitHandler}>

            <input className='form-control mb-3'
                placeholder="Full Name"
                name="full_name"
                value={user.full_name}
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.full_name}</p>

            <input className='form-control mb-3'
                placeholder="Username"
                name="username"
                value={user.username}
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.username}</p>

            <input className="form-control mb-3"
                placeholder="Email"
                name="email"
                value={user.email}               
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.email}</p>

            <input className="form-control mb-3"
                placeholder="Mobile"
                name="mobile"
                value={user.mobile}
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.mobile}</p>

            <input className="form-control mb-3"
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}               
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.password}</p>

            <button className="btn btn-primary">
                Register
            </button>

        </form>

        <Link to="/login">Login</Link>
    </div>
 );
}

export default Register;