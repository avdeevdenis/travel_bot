import * as fs from 'fs';

/**
 * Считывает содержимое файла, как JSON (либо возвращает пустой объект)
 */
export const getFileJSONContent = async (filePath: string, errorCallback?: (error: Error) => void) => {
  let fileContent;

  try {
    fileContent = await fs.readFileSync(filePath, { encoding: 'utf8' });
  } catch (error) {
    errorCallback && await errorCallback(new Error('[getFileJSONContent] Error to read file' + error.message));

    return false;
  }

  let fileContentJSON;

  if (!fileContent.length) {
    fileContentJSON = {};
  } else {
    try {
      fileContentJSON = JSON.parse(fileContent);
    } catch (error) {
      errorCallback && await errorCallback(new Error('[getFileJSONContent] Error to parse json' + error.message));

      return false;
    }
  }

  return fileContentJSON;
};