import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        email: "",
        password: ""
    });

    const changeHandler = (e) => {
        setUser({
            ...user,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post("http://localhost:3000/login", user);
            const data = res.data;

            if (data.flag === 0) {
                alert(data.message);
                return;
            }

            localStorage.setItem("u_id", data.uid);
            localStorage.setItem("u_email", data.umail);
            localStorage.setItem("u_name", data.uname);

            sessionStorage.setItem("u_sid", data.uid);
            sessionStorage.setItem("u_name", data.uname);
            sessionStorage.setItem("u_semail", data.umail);

            alert(data.message);
            navigate("/");
        } catch (error) {
            alert(error.response?.data?.message || "Login failed");
        }
    };

    return (
    <div className="container mt-5">
        <h2>Login</h2>


        <form onSubmit={submitHandler}>
            {/* <input className="form-control mb-3"
                placeholder="Name"
                name="name"
                onChange={changeHandler}
            /> */}
            <input className="form-control mb-3"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={changeHandler}
            />
            <input className="form-control mb-3"
                type="password"
                placeholder="Password"
                name="password"
                value={user.password}
                onChange={changeHandler}
            />

            <button className="btn btn-primary">
                Login
            </button>
        </form>
        <Link to="/">Login</Link>
    </div>
);

}
export default Login;