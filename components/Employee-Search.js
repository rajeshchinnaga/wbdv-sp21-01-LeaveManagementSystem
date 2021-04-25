import React,{useState,useEffect} from 'react'
import {Link,useParams} from 'react-router-dom'
import employeeService from "../services/Employee-dbService"
import employeeDBService from "../services/Employee-Service.ejs"
const EmployeeSearch =() =>{
    const {EmployeeName} = useParams()
    const [results,setResults] = useState([])
    const [employee,setEmployees] = useState([])
    // useEffect(()=>{
    //     findEmployeeSearch()
    // },[])
    const findEmployeeSearch = () =>{
        employeeService.findEmployee().then((results) => {
            setResults(results)
            console.log(results)
        })

        employeeDBService.createEmployee(results).then((emp) => {
            console.log("After creation")
            console.log(emp)
        })
    }

    return(
        <div>
            <h1>Employee Search</h1>
            <button onClick={findEmployeeSearch} className="btn btn-primary">
                Search
            </button>
            <br/>
            {/*<Link to={`/EmployeeDetails/LastName`}>*/}
            Full Name : {results["FullName"]} <br/>
            First Name: {results["FirstName"]} <br/>
            Last Name: {results["LastName"]} <br/>
            City: {results["City"]} <br/>
            State: {results["State"]} <br/>
            Zip: {results["Zip"]} <br/>
            Email: {results["Email"]} <br/>
            Phone: {results["Phone"]} <br/>
            Company: {results["Company"]} <br/>
            Title: {results["Title"]} <br/>
            DOB: {results["Birthdate"]} <br/>
            {/*</Link>*/}
            {/*<ul className="list-group">

                {
                    results.map((employees) => {
                        return(
                            <li className="list-group-item">
                                <Link to={`/EmployeeDetails/LastName`}>
                                    {employees["FullName"]}
                                </Link>
                            </li>
                        )
                    })
                }
                <li className="list-group-item">
                    <Link to={`/EmployeeDetails/LastName`}>
                        Rajesh Chinnaga
                    </Link>

                </li>
                <li className="list-group-item">
                    <Link to={`/EmployeeDetails/LastName`}>
                        Lokesh Chinnaga
                    </Link>

                </li>
                <li className="list-group-item">
                    <Link to={`/EmployeeDetails/LastName`}>
                        Padmavathi Chinnaga
                    </Link>
                </li>
            </ul>*/}
        </div>
    )
}
export default EmployeeSearch