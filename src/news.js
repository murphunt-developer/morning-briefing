
import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const fetchData = async (url) => {
  try {
    const response = await axios.get(url);
    // console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching data:', error.message);
  }
}

export const pullNewsData = async () => {
  const techCrunch = await fetchData('https://techcrunch.com/feed/');
  const javascriptWeekly = await fetchData('https://javascriptweekly.com/latest');
  const nodeWeekly = await fetchData('https://nodeweekly.com/latest');
  return techCrunch + javascriptWeekly + nodeWeekly;
}