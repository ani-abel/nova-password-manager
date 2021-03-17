import * as CryptoJS from 'crypto-js';
import { v4 as uuidv4 } from 'uuid';
import { parse, stringify } from 'flatted';
import { Plugins } from '@capacitor/core';

const { Storage } = Plugins;

export const saveDataToLocalStorage = async <T>(payload: T, key: string): Promise<void> => {
  await Storage.set({
    key,
    value: JSON.stringify(payload)
  });
};

export const getDataFromLocalStorage = async <T>(key: string): Promise<T> => {
  const ret = await Storage.get({ key });
  return JSON.parse(ret.value);
};

export const deleteDataFromLocalStorage = async (key: string): Promise<void> => {
  await Storage.remove({ key });
}

export const generateUniqueHexEncryptionKey = (): string => uuidv4();

export const encryptData = (text: any, key: string): string => {
  try {
    const encrypted = CryptoJS.AES.encrypt(`${text}`, key);
    console.log(encrypted.toString());
    return stringify({ encryptedPayload: encrypted });
  }
  catch (ex) {
    throw ex;
  }
};

export const decryptData = (text: string, key: string): string => {
  try {
    const parsedtext: any = parse(text);
    const encrypted = parsedtext.encryptedPayload;
    const decrypted: any = CryptoJS.AES.decrypt(encrypted, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  catch (ex) {
    throw ex;
  }
};

export const encryptObjectData = <T>(text: T, key: string): string => CryptoJS.AES.encrypt(stringify(text), key);

export const decryptObjectData = <T, K>(text: T, key: string): K => {
  try {
    const decrypted = CryptoJS.AES.decrypt(text, key);
    const data = CryptoJS.enc.Utf8.stringify(decrypted);
    return parse(data.toString(CryptoJS.enc.Utf8));
  }
  catch (ex) {
    throw ex;
  }
};
