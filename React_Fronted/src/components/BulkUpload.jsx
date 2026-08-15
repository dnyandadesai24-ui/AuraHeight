import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function BulckUpload(){
    const[data,setData]=useState([]);

    //Read Excel file
    const handleFile=(e)=>{
        const file=e.target.files[0];

        if(!file)return;

        const reader =new FileReader();

        reader.onload = (event) =>{
            const workbook=XLSX.read(event.target.result,{type:"binary"});

            const sheetName=workbook.SheetNames[0];

            const sheet = workbook.Sheets[sheetName];

            const excelData = XLSX.utils.sheet_to_json(sheet);

            console.log(excelData);

            setData(excelData);

        };

        reader.readAsBinaryString(file);
    };

    //upload Data
    const uploadData = async () => {

        try{
            const res = await axios.post("http://localhost:3003/bulck-upload",
                {
                    users:data,
                }
            );
            alert(res.data.message);
        }catch (err){
            console.log(err);
        }
    };
 
    return(
        <div>
            <h2>Bulk Upload</h2>

            <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFile}
            />
            <br /><br />

            <button onClick={uploadData}>
                Upload
            </button>

            <br /><br />

            
        </div>
    );
}
export default BulckUpload;