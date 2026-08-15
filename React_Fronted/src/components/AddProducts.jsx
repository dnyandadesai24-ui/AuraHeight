import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function AddProduct() {
    const navigate = useNavigate();

    const [product, setProduct] = useState({
        pname: "",
        pdsp: "",
        pmrp: "",
        uid: "",
        upload_img: ""
    });

    const [image, setImage] = useState(null);
    const [errors, setErrors] = useState({});

    const changeHandler = (e) => {
        const { name, value } = e.target;

        setProduct({
            ...product,
            [name]: value
        });

        let error = "";

        if (name === "pmrp") {
            if (!/^\d*$/.test(value)) {
                error = "Must be number";
            } else if (Number(value) < 0) {
                error = "Cannot be negative";
            }
        }

        if (name === "uid") {
            if (!/^\d*$/.test(value)) {
                error = "User Id must be number";
            }
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };

    const addValidate = () => {
        let newErrors = {};

        if (product.pname.trim() === "") {
            newErrors.pname = "Product Name is required";
        }

        if (product.pdsp === "") {
            newErrors.pdsp = "Discription is required";
        } 

        if (product.pmrp === "") {
            newErrors.pmrp = "MRP is required";
        } else if (Number(product.pmrp) < 0) {
            newErrors.pmrp = "MRP cannot be negative";
        }

        if (product.uid === "") {
            newErrors.uid = "User Id is required";
        }

        if (!image) {
            newErrors.upload_img = "Product Image is required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const submitHandler = async (e) => {
        e.preventDefault();

        if (addValidate()) {
            try {
                const formData = new FormData();

                formData.append("pname", product.pname);
                formData.append("pdsp", product.pdsp);
                formData.append("pmrp", product.pmrp);
                formData.append("uid", product.uid);
                formData.append("image",image);

                const res = await axios.post(
                    "http://localhost:3003/add-prod",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );

                alert(res.data.message);

                setProduct({
                    pname: "",
                    pdsp: "",
                    pmrp: "",
                    uid: "",
                    upload_img: ""
                });

                setImage(null);

                // navigate("/products1");

            } catch (err) {
                console.log(err);
                alert("Product Image Upload Failed");
            }
        }
    };

    return (
        <div className="container mt-5">

            <h2>Add Product</h2>

            <form onSubmit={submitHandler}>

                <input
                    className="form-control mb-2"
                    placeholder="Product Name"
                    name="pname"
                    value={product.pname}
                    onChange={changeHandler}
                />
                <p style={{ color: "red" }}>{errors.pname}</p>

                <input
                    className="form-control mb-2"
                    placeholder="Discription"
                    name="pdsp"
                    value={product.pdsp}
                    onChange={changeHandler}
                />
                <p style={{ color: "red" }}>{errors.pdsp}</p>

                <input
                    className="form-control mb-2"
                    placeholder="MRP"
                    name="pmrp"
                    value={product.pmrp}
                    onChange={changeHandler}
                />
                <p style={{ color: "red" }}>{errors.pmrp}</p>

                <input
                    className="form-control mb-2"
                    placeholder="User Id"
                    name="uid"
                    value={product.uid}
                    onChange={changeHandler}
                />
                <p style={{ color: "red" }}>{errors.uid}</p>

                <input
                    type="file"
                    accept="image/*"
                    className="form-control mb-2"
                    onChange={(e) => setImage(e.target.files[0])}
                />
                <p style={{ color: "red" }}>{errors.upload_img}</p>

                <button className="btn btn-primary">
                    Save
                </button>

            </form>

            <br />

            <Link to="/login" className="me-3">
                Login
            </Link>

            <br />

            <Link to="/products1">
                View Products
            </Link>

        </div>
    );
}

export default AddProduct;