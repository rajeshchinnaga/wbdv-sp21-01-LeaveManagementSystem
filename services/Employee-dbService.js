const EMPLOYEE_URL = "http://localhost:5000/api/users";

const findAllEmployees = () =>
    fetch(EMPLOYEE_URL)
        .then(response => response.json())

export const findEmployeeById = (employeeId) =>
    fetch(`${EMPLOYEE_URL}/${employeeId}`)
        .then(response => response.json())
//
// export const deleteEntry = (entryId) =>
//     fetch(`${EMPLOYEE_URL}/${entryId}`, {
//         method: 'DELETE'
//     })
//         .then(response => response.json())

const createEmployee = (employee) =>
    fetch(EMPLOYEE_URL, {
        method: 'POST',
        body: JSON.stringify(employee),
        headers: {
            'content-type': 'application/json'
        }
    })
        .then(response => response.json())

// export const updateEntry = (entryId, entry) =>
//     fetch(`${ENTRIES_URL}/${entryId}`, {
//         method: 'PUT',
//         body: JSON.stringify(entry),
//         headers: {
//             'content-type': 'application/json'
//         }
//     })
//         .then(response => response.json())

const employeeDBService = {findAllEmployees,createEmployee,findEmployeeById}
export default employeeDBService