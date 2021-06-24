import axios from 'axios';
import * as fs from 'fs';

import { getAjaxUrl } from '../../helpers/get_ajax_url/get_ajax_url';
import { ResponseData } from '../../typings';
import { isDev } from '../is_dev/is_dev';

export const getReponseData: () => Promise<ResponseData> = async () => {
  /**
   * Чтобы не нагружать каждый раз сеть - при разработке используем данные из файла
   */
  const responseData = isDev ?
    getReponseFromTempFile() :
    getResponseFromAjax();

  return responseData;
};

const getResponseFromAjax = async () => {
  const ajaxUrl = getAjaxUrl();

  let response;

  try {
    response = await axios.get(ajaxUrl, {
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