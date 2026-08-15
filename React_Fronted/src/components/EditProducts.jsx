import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

function EditProducts() {

    const navigate = useNavigate();
    const { pid } = useParams();

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
                error = "MRP must be number";
            } else if (Number(value) < 0) {
                error = "MRP cannot be negative";
            }
        }

        if (name === "uid") {
            if (!/^\d*$/.test(value)) {
                error = "User ID must be number";
            }
        }

        setErrors({
            ...errors,
            [name]: error
        });
    };

    const updateValidate = () => {

        let newErrors = {};

        if (product.pname.trim() === "") {
            newErrors.pname = "Product Name Required";
        }

        if (product.pdsp === "") {
            newErrors.pdsp = "Description Required";
        }

        if (product.pmrp === "") {
            newErrors.pmrp = "MRP Required";
        }

        if (product.uid === "") {
            newErrors.uid = "User ID Required";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const loadProduct = async () => {

        const res = await axios.get(
            `http://localhost:3003/prod-list/${uid}`
        );
        console.log(res.data);
        setProduct(res.data);
    };

    useEffect(() => {
        loadProduct();
    }, []);

    const submitHandler = async (e) => {

        e.preventDefault();

        if (updateValidate()) {

            const formData = new FormData();

            formData.append("pname", product.pname);
            formData.append("pdsp", product.pdsp);
            formData.append("pmrp", product.pmrp);
            formData.append("uid", product.uid);

            if (image) {
                formData.append("image", image);
            }

            const res = await axios.put(
                `http://localhost:3003/update1/${pid}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            alert(res.data.message);

            navigate("/prod-list");
        }
    };

    return (

        <div className="container mt-5">

            <h2>Edit Product</h2>

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
                    placeholder="Description"
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
                    placeholder="User ID"
                    name="uid"
                    value={product.uid}
                    onChange={changeHandler}
                />
                <p style={{ color: "red" }}>{errors.uid}</p>

                <input
                    type="file"
                    className="form-control mb-2"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                <button className="btn btn-primary">
                    Update
                </button>

            </form>

        </div>
    );
}

export default EditProducts;