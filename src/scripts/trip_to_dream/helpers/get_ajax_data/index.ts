import axios from 'axios';

export const getAjaxData = async (url: string) => {
  const response = await axios.get(url);

  const isSuccesedResponse = response && response.status === 200 && response.statusText === 'OK';

  if (!isSuccesedResponse) {
    return Promise.resolve(new Error('Ajax request error, response.status = ' + response.status));
  }

  const responseData = response.data;

  return responseData;
}
