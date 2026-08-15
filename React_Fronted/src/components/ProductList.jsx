
// export default ProductList;
import { useEffect,useState } from "react";
import axios from "axios";
import {Link,useNavigate} from "react-router-dom";

function ProductList(){

    const [products,setProducts]=useState([]);
    const[page,setPage]=useState(1);
    const[totalPages,setTotalPages]=useState(1);
    const limit=5;

    // const loadUsers=async()=>{
    //     const res=await axios.get(
    //         "http://localhost:5000/users1"
    //     );
    //     console.log(res);
    //     setUsers(res.data);
    // };
    
    const getProducts=async()=>{

            const uid = localStorage.getItem("u_id");

        const res=await axios.get(`http://localhost:3003/paginate1?page=${page}&limit=${limit}&uid=${uid}`);

        setProducts(res.data.data);
        setTotalPages(res.data.totalPages);
    };
    console.log(totalPages);
    console.log(limit);

    // useEffect(() => {

    //     loadUsers();

    // }, []);

    useEffect(()=>{
        getProducts();
    }, [page]);

    const deleteProduct = async (pid) => {

       const res= await axios.delete(
            `http://localhost:3003/products/${pid}`
        );
        console.log(res);

        getProducts();

    };
    function logout() {
  sessionStorage.clear();
  window.location.href = "/login";
}

console.log(products);

console.table(products);

return (
        <div className="container mt-5">

            <h2>Hello {localStorage.getItem("u_name")}</h2>

            <Link to="/add-prod" className="btn btn-success mb-3">
                Add Products
            </Link>

            <button onClick={logout}>Logout</button>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Product ID</th>
                        <th>Product Name</th>
                        <th>Product Discription</th>
                        <th>Product MEP</th>
                        <th>User ID</th>
                        <th>Image</th>
                        <th>Action</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {
                    
                        products.map((p) => (
                            <tr key={p.pid}>

                                <td>{p.pid}</td>
                                <td>{p.pname}</td>
                                <td>{p.pdsp}</td>
                                <td>{p.pmrp}</td>
                                <td>{p.uid}</td>
                                <td>
                                 <img
                                       src={`http://localhost:3003/uploads/${p.upload_img}`}
                                                    alt="Product"
                                                    width="80"
                                                    height="80"
                                 />
                                </td>
                                <td>
                                    <Link className="btn btn-warning me-2" to={`/update1/${p.pid}`}>
                                        Edit
                                    </Link>
                                    <button className="btn btn-danger" onClick={() =>deleteUser(p.pid)}>
                                        Delete
                                    </button>
                                    <button className="btn btn-success mb-3" onClick={logout}>
                                        Logout
                                    </button>
                                </td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
            <br/>
            <button disabled={page===1} onClick={()=> setPage(page-1)} >

                Previous
            </button>

            <span style={{margine:"0 20px"}}>
                Page {page} of {totalPages}
            </span>

            <button disabled={page===totalPages}
              onClick={() => setPage(page+1)}>
                Next
              </button>

        </div>
    );
}

export default ProductList;