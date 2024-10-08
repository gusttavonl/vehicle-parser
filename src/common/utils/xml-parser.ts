import { parseStringPromise } from 'xml2js';

export const parseXmlToJson = async (xmlData: string): Promise<any> => {
  try {
    return await parseStringPromise(xmlData);
  } catch (error) {
    throw new Error(`Error parsing XML data: ${error}`);
  }
};
