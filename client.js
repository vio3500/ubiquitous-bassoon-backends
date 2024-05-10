const axios= require('axios');

const api = 'http://localhost:5000/';

axios.get(api).then(res => console.log(res.data));