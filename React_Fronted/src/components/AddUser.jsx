import { useState } from "react";
import axios from "axios";
import {Link,useNavigate} from "react-router-dom";

function AddUser(){
    const navigate=useNavigate();

    const [user,setUser]=useState({
        name:"",
        email:"",
        password:"",
        salary:"",
        DOB:"",
        upload_image:""
        
    });

    const [errors,setErrors]=useState({});  
    const [image,setimage]=useState(null); 
    const changeHandler=(e)=>{
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
                error="Password Should be atleast 6 letters";
            }
        }

        setErrors({
            ...errors,
            [name]:error
        })
    };

    const addValidate=()=>{
        
        let newErrors={};

        if(user.name.trim()==="")
        {
            newErrors.name="Name Is Required !!"
        }

        // if(user.email==="")
        // {
        //     newErrors.email="Email Is Required !!"           
        // }
        // else if(!/\S+@\S+\.\S+/.test(user.email))
        // {
        //     newErrors.email="Invalid Email"
        // }

        // if(user.password==="")
        // {
        //     newErrors.password="Password Is Required !!"
        // }

        // else if(user.password.length<6)
        // {
        //     newErrors.password="Password must be atleast 6 characters !!"
        // }

        // if(user.salary==="")
        //  {
        //     newErrors.salary="Salary Is Required!!"
        //  }

        if(user.DOB==="")
         {
            newErrors.DOB="DOB Is Required!!"
         }

        if(!image)
         {
            newErrors.upload_image="Upload_image Is Required!!"
         }
        setErrors(newErrors);
       return Object.keys(newErrors).length===0;
    };

    const submitHandler = async (e) =>{
        e.preventDefault();

        // alert("Registration succsseful");
       if (addValidate()){

        const formData = new FormData();

        formData.append("name",user.name);
        formData.append("email",user.email);
        formData.append("password",user.password);
        formData.append("salary",user.salary);
        formData.append("DOB",user.DOB);
        formData.append("upload_image",image);

        const response=await axios.post("http://localhost:3003/users",formData);

         console.log(response.data.message);
         alert(response.data.message);

         navigate("/users");
       }
    };
return(
    <div className="container mt-5">
        <h2>Add User</h2>


        <form onSubmit={submitHandler}>
            <input className="form-control mb-3"
                placeholder="Name"
                name="name"
                value={user.name}
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.name}</p>

            <input className="form-control mb-3"
                placeholder="Email"
                name="email"
                value={user.email}
                onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.email}</p>

            <input className="form-control mb3"
                type="password"
                 placeholder="Password"
                 name="password"
                 value={user.password}
                 onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.password}</p>

            <input className="form-control mb3"
                 placeholder="Salary"
                 name="salary"
                 value={user.salary}
                 onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.salary}</p>

            <input className="form-control mb3"
                  type="date"
                  placeholder="date of birth"
                  name="DOB"
                  value={user.DOB}
                  onChange={changeHandler}
            />

            <p style={{color:"red"}}>{errors.DOB}</p>

            <input className="form-control mb3"
                  placeholder="upload_image"
                  name="upload_image"
                  type="file"
                  onChange={(e)=>setimage(e.target.files[0])}
            />

            <p style={{color:"red"}}>{errors.upload_image}</p>

            <button className="btn btn-primary">
                Save
            </button>
        </form>
    
    </div>
);

}
export default AddUser;