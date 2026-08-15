import {useState,useEffect} from "react";
import axios from "axios";
import {Link,useNavigate,useParams} from "react-router-dom";

function EditUser(){
       const {id}=useParams();
       const navigate=useNavigate();

       const[user,setUser]=useState({
        name:"",
        email:"",
        password:""

       });

       useEffect(() =>{
        loadUser();
       },[]);

    const loadUser=async()=>{
        const res=await axios.get(
            `http://localhost:3003/users2/${id}`
        );
        console.log(res.data);
        setUser(res.data);
    };

    const[errors,setErrors]=useState({});

    const changeHandler=(e) =>{
        console.log(e.target.name, e.target.value);
        const{name,value}=e.target;
        // setUser({
        //     ...user,
        //     [e.target.name]:e.target.value
        // });
                setUser({
            ...user,
            [name]:value
        });
        //keypress validation

        let error="";

        if(name==="email")
        {      
            if(!/\S+@\S+\.\S+/.test(value))
            {
                error="Enter valid Email";
            }
        };

        if(name==="password")
        {
            if(value.length<6){
                error="Enter Password Should be atleast 6 letters";
            }
        }

        setErrors({
            ...errors,
            [name]:error
        })
    };
   
    const validate=()=>{
        let newErrors={};

        if(user.name.trim()===""){
            newErrors.name="Name Is Required!!"
        }

        if(user.email===""){
            newErrors.email="Email Is Required!!"
        }
        else if(!/\S+@\S+\.\S+/.test(user.email)){
        newErrors.email="Invalid email";
        }

        if(user.password===""){
            newErrors.password="Password Is Required!!"
        }
        else if(user.password.length<6){
            newErrors.password="Password Must Be Required Atleast 6 Characters!!"
        }
       if(user.salary==="")
        {
            newErrors.salary="Salary Is Required!!"
        }  
        setErrors(newErrors);
        return Object.keys(newErrors).length===0;
    }
     const submitHandler=async(e)=>{
        e.preventDefault();
        if(validate()){
             await axios.put(`http://localhost:3003/update/${id}`,user);

        navigate("/users1");

        }
       
    };

    

return(
     <div className="container mt-5">
        <h2>Edit User</h2>
        <form onSubmit={submitHandler}>
            
            <input className="form-control mb-2"
              name="name"
              value={user.name}
              onChange={changeHandler}
            />
            <p style={{color:"red"}}>{errors.name}</p>

            <input 
              className="form-control mb-2"
              name="email"
              value={user.email}
              onChange={changeHandler}
              />
              <p style={{color:"red"}}>{errors.email}</p>

            <input className="form-control mb-2"
              name="password"
              value={user.password}
              onChange={changeHandler}
            />
            <p style={{color:"red"}}>{errors.password}</p>

            <button className="btn btn-primary">
                Update
            </button>
        </form>
     </div>
    );
}
export default EditUser;