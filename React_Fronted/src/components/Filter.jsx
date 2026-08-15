import { useState } from "react";
import axios from "axios";

function Filter() {

    const [formData, setFormData] = useState({
        id: "",
        name: "",
        email: "",
        salary: ""
    });

    const [data, setData] = useState([]);

    const changeHandler = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        try {

            const res = await axios.post("http://localhost:3003/filter", formData);

            setData(res.data.data);

        }
        catch (err) {
            alert(err.response.data.message);
        }
    };

    return (
        <div>

            <h2>Filter Employee</h2>

            <form onSubmit={submitHandler}>

                <input
                    type="number"
                    name="id"
                    placeholder="Enter Id"
                    value={formData.id}
                    onChange={changeHandler}
                />

                <input
                    type="text"
                    name="name"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={changeHandler}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Enter Email"
                    value={formData.email}
                    onChange={changeHandler}
                />

                <input
                    type="number"
                    name="salary"
                    placeholder="Enter Salary"
                    value={formData.salary}
                    onChange={changeHandler}
                />

                <button type="submit">Filter</button>

            </form>

            <br />

            <table border="1">
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Salary</th>
                    </tr>
                </thead>

                <tbody>
                    {
                        data.map((item) => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{item.name}</td>
                                <td>{item.email}</td>
                                <td>{item.salary}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>

        </div>
    );
}

export default Filter;