import axios from 'axios';

export const baseURL = 'http://1e405808319d.ngrok.io';

const api = axios.create({
  baseURL
});

export default api;