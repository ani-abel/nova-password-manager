import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Router } from "@angular/router";
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import { v4 as uuidv4 } from 'uuid';
import { environment as env } from '../../environments/environment';
import { LocalStorageKeyType, UserRecordType } from '../utils/types/shared.type';
import { deleteDataFromLocalStorage, getDataFromLocalStorage } from '../utils/functions/shared.function';

@Injectable({
  providedIn: 'root'
})
export class UtilLogicService {
  private bucket: S3;

  constructor(
    private readonly toastController: ToastController,
    private readonly router: Router,
  ) {
    const {
      aws: {
        region,
        accessKeyId,
        secretAccessKey
      }
    } = env;

    this.bucket = new S3({
      accessKeyId,
      secretAccessKey,
      region,
      maxRetries: 3,
    });
  }

  async presentToast(message: string): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 5000,
      position: 'top',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log({ message: 'Cancel clicked' });
          }
        }
      ]
    });
    toast.present();
  }

  async deleteFileFromS3(filePath: string): Promise<boolean> {
    try {
      const {
        aws: {
          bucketName,
          keyName
        }
      } = env;
      const params = {
        Bucket: bucketName,
        Key: `${keyName}/${filePath}`
      };

      return await new Promise((resolve, reject) => {
        this.bucket.deleteObject(params, (err, data) => {
          if (err) {
            reject(err);
          }
          resolve(true);
        });
      });
    }
    catch (ex) {
      throw ex;
    }
  }

  async uploadFileToS3(file: File | Blob): Promise<string> {
    const {
      aws: {
        bucketName,
        keyName,
      }
    } = env;
    const contentType = file.type;
    const [, ext] = contentType.split('/');
    const params: S3.PutObjectRequest = {
      Bucket: bucketName,
      Key: `${keyName}/${uuidv4()}.${ext}`,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType
    };
    const responseData: any = await new Promise((resolve, reject) => {
      this.bucket.upload(params, (err, data) => {
        if (err) {
          reject(err);
        }
        resolve(data);
      });
    });
    return responseData?.Location;
  }

  // ? Run when deleting time limit of 10 minutes is up
  async logout(): Promise<void> {
    await deleteDataFromLocalStorage(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);
    this.router.navigate(['/login']);
  }

  async loginAsync(): Promise<void> {
    const userData: UserRecordType = await getDataFromLocalStorage<UserRecordType>(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);
    if (userData?.Id) {
      this.router.navigate(["/tabs"]);
    }
  }

  createDownloadLink(blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const au = document.createElement('audio');
    const li = document.getElementsByTagName('main')[0];
    const link = document.createElement('a');
    // add controls to the <audio> element
    au.controls = true;
    au.src = url;
    // link the a element to the blob
    link.href = url;
    link.download = new Date().toISOString() + '.wav';
    link.innerHTML = link.download;
    // add the new audio and a elements to the li element
    li.appendChild(au);
    li.appendChild(link);
  }

}
