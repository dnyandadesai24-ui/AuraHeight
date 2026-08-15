import {Navigate} from "react-router-dom";

function ProtectRoute({children}){
    const email=sessionStorage.getItem("email");
    return email ? children:<Navigate to="/login" replace/>
}

export default ProtectRoute;