export default function authHeader () {
    const authToken = localStorage.getItem('token');
    let  headers = {}

    if (authToken !== undefined && authToken !== null) {
        headers = {
            'authorization': 'Token  ' + authToken
        }
    }

    return headers;
}