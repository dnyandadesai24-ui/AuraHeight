// import { useEffect , useState } from "react";
// import axios from "axios";
// import { Link,useNavigate} from "react-router-dom";

// function UserList(){

//     const [users,setUsers]=useState([]);
//     const [page,setPage]=useState(1);
//     const [totalPages,setTotalPages]=useState(1);
//     const limit=5;
//     // const loadUsers= async () =>{

//     //     const res = await axios.get("http://localhost:3003/users1");
//     //     console.log(res);
//     //     setUsers(res.data);
//     // };

//     const getUsers=async()=>{
//         const res=await axios.get(
//             `http://localhost:3003/paginate?page=${page}&limit=${limit}`);

//         setUsers(res.data.data);
//         setTotalPages(res.data.totalPages);
//     };
//     console.log(totalPages)
//     //  useEffect(()=>{
//     //     loadUsers();
//     //  },[]);

//     useEffect(()=>{
//         getUsers();
//     },[page]);

//      const deleteUser=async (id) => {

//         await axios.delete(
//            ` http://localhost:3003/users/${id}`
//         );

//         loadUsers();
//      }
// return(
//     <div className="container mt-5">

//         <Link to="/add" className="btn btn-success mb-3">
//          Add User
//         </Link>
//         <table className="table table-bordered">
//             <thead>
//                 <tr>
//                     <th>ID</th>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Password</th>
//                     <th>Salary</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {
//                     users.map((u)=>(
//                         <tr key={u.id}>
//                             <td>{u.id}</td>
//                             <td>{u.name}</td>
//                             <td>{u.email}</td>
//                             <td>{u.password}</td>
//                             <td>{u.salary}</td>
//                             <td>
//                                  <img
//                                        src={`http://localhost:5000/uploads/${u.upload_image}`}
//                                                     alt="User"
//                                                     width="80"
//                                                     height="80"
//                                  />
//                             </td>
//                             <td>
//                                 <Link className="btn btn-warning m e-2"to={`/update/${u.id}`}>
//                                  Edit
//                                 </Link>
//                                 <button className="btn btn-danger" onClick={()=>deleteUser(u.id)}>
//                                  Delete
//                                 </button>
//                             </td>
//                         </tr>
//                     ))
//                 }
//             </tbody>
//         </table>
//         <br />

//         <button disabled={page===1} onClick={()=>setPage(page-1)}>
//             Previous
//         </button>

//         <span style={{margin:"0 20px"}}>
//             Page{page}of{totalPages}
//         </span>

//         <button disabled={page===totalPages}onClick={()=>setPage(page+1)}>
//             Next
//         </button>

//     </div>
// );
// }

// export default UserList;
import { useEffect,useState } from "react";
import axios from "axios";
import {Link,useNavigate} from "react-router-dom";

function UserList(){
    const [users,setUsers]=useState([]);
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

    const getUsers=async()=>{
        const res=await axios.get(`http://localhost:3003/paginate?page=${page}&limit=${limit}`);

        setUsers(res.data.data);
        setTotalPages(res.data.totalPages);
    };
    console.log(totalPages);
    console.log(limit);

    // useEffect(() => {

    //     loadUsers();

    // }, []);

    useEffect(()=>{
        getUsers();
    },[page]);

    const deleteUser = async (id) => {

       const res= await axios.delete(
            `http://localhost:3003/users/${id}`
        );
        console.log(res);

        loadUsers();

    };
    function logout() {
  sessionStorage.clear();
  window.location.href = "/login";
}


return (
        <div className="container mt-5">

            <h2>Hello {localStorage.getItem("u_name")}</h2>

            <Link to="/users" className="btn btn-success mb-3">
                Add User
            </Link>

            <button onClick={logout}>Logout</button>

            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Password</th>
                        <th>Salary</th>
                        <th>Image</th>
                        <th>Action</th>
                        
                    </tr>
                </thead>
                <tbody>
                    {
                        users.map((u) => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.password}</td>
                                <td>{u.salary}</td>
                                <td>
                                 <img
                                       src={`http://localhost:3003/uploads/${u.upload_image}`}
                                                    alt="User"
                                                    width="80"
                                                    height="80"
                                 />
                                </td>
                                <td>
                                    <Link className="btn btn-warning me-2" to={`/update/${u.id}`}>
                                        Edit
                                    </Link>
                                    <button className="btn btn-danger" onClick={() =>deleteUser(u.id)}>
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

export default UserList;