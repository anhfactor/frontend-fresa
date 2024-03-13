import axios from 'axios';
import { store } from '../redux/store';
const {
  formLang: { defaultLang },
} = store.getState();

export default async function getAddressFromLocation(
  location,
  key = 'AIzaSyDZQUsmwnkCmD3HMNFCABo8YSE54FCTFYo'
) {
  let params = {
    language: defaultLang || 'en',
    latlng: `${location?.lat},${location?.lng}`,
    key,
  };
  return axios
    .get(`https://maps.googleapis.com/maps/api/geocode/json`, { params })
    .then(({ data }) => data.results[0]?.formatted_address)
    .catch((error) => {
      console.log(error);
      return 'not found';
    });
}
