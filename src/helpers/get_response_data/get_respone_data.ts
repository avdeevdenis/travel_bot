import axios from 'axios';
import * as fs from 'fs';

import { ResponseData } from '../../typings';
import { isDev } from '../is_dev/is_dev';

export const getReponseData: (url: string) => Promise<ResponseData> = async (url) => {
  /**
   * Чтобы не нагружать каждый раз сеть - при разработке используем данные из файла
   */
  const responseData = isDev ?
    getReponseFromTempFile() :
    getResponseFromAjax(url);

  return responseData;
};

const getResponseFromAjax = async (url: string) => {
  let response;

  try {
    response = await axios.get(url, {
      headers: {
        'x-requested-with': 'XMLHttpRequest'
      }
    });
  } catch (error) {
    console.log('Error within ajax request', error.message);
  }

  const isSuccesedResponse = response && response.status === 200 && response.statusText === 'OK';

  if (!isSuccesedResponse) {
    console.log('Is not succesed response', response);
    return;
  }

  const responseData: ResponseData = response.data;

  return responseData;
}

const getReponseFromTempFile = async () => {
  const fileData = await fs.readFileSync('./src/data/temp_response_data.json', { encoding: 'utf-8' });
  const fileDataJSON = JSON.parse(fileData);

  return fileDataJSON as ResponseData;
};