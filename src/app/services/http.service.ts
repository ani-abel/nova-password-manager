import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment as env } from '../../environments/environment';
import {
  AuthenticatelVoiceItUserResponseType,
  AuthenticateVoiceItUserType,
  AuthRecordType,
  CreateVoiceItUserType,
  CustomAPIType,
  EnrollVoiceItUserResponseType,
  EnrollVoiceItUserType,
  MessageType,
  PhraseType,
  VoiceItPhraseType,
  UserRecordType
} from '../utils/types/shared.type';
import '@capacitor-community/http';

import { Plugins } from '@capacitor/core';
import { isPlatform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  item$: Observable<any[]>;
  constructor(
    private readonly firestore: AngularFirestore,
    private readonly httpClient: HttpClient
  ) {
    this.item$ = firestore.collection('AuthRecord').valueChanges();
  }

  async addAuthRecord(payload: AuthRecordType): Promise<string> {
    try {
      const responseData: any =
        await this.firestore
          .collection('AuthRecord')
          .add(payload);
      return responseData?.id;
    }
    catch (ex) {
      throw ex;
    }
  }

  async deleteAuthRecord(id: string): Promise<CustomAPIType> {
    try {
      // await this.firestore.doc(`AuthRecord/${id}`).delete();
      await this.firestore.collection('AuthRecord').doc(id).delete();
      return {
        Message: 'DELETED',
        Type: MessageType.SUCCESSFUL
      };
    }
    catch (ex) {
      throw ex;
    }
  }

  async updateAuthRecord(id: string, payload: Partial<AuthRecordType>)
    : Promise<CustomAPIType> {
    try {
      await this.firestore.collection('AuthRecord').doc(id).update(payload);
      return {
        Message: 'UPDATED',
        Type: MessageType.SUCCESSFUL
      };
    }
    catch (ex) {
      throw ex;
    }
  }

  getAuthRecord(id: string): Observable<AuthRecordType> {
    return this.firestore
      .collection('AuthRecord')
      .doc(id)
      .get()
      .pipe(
        map((data: any) => {
          return {
            Id: data.d_.id,
            ...data.d_.data()
          };
        }),
      );
  }

  getAuthRecords(): Observable<AuthRecordType[]> {
    return this.firestore
      .collection('AuthRecord')
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((e: any) => {
            return {
              Id: e.payload.doc.id,
              ...e.payload.doc.data()
            };
          });
        })
      );
  }

  getAuthRecordsByUserId(userId: string): Observable<AuthRecordType[]> {
    return this.firestore
      .collection('AuthRecord', (ref) => ref.where('UserId', '==', userId))
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((e: any) => {
            return {
              Id: e.payload.doc.id,
              ...e.payload.doc.data()
            };
          });
        })
      );
  }

  async addUserRecord(payload: UserRecordType)
    : Promise<string> {
    try {
      const responseData: any =
        await this.firestore
          .collection("UserRecord")
          .add(payload);
      return responseData?.id;
    }
    catch (ex) {
      throw ex;
    }
  }

  getUserRecords(): Observable<UserRecordType[]> {
    return this.firestore
      .collection('UserRecord')
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return data.map((e: any) => {
            return {
              Id: e.payload.doc.id,
              ...e.payload.doc.data()
            };
          });
        })
      );
  }

  getUserRecordById(id: string): Observable<UserRecordType> {
    return this.firestore
      .collection('UserRecord')
      .doc(id)
      .get()
      .pipe(
        map((data: any) => {
          return {
            Id: data.d_.id,
            ...data.d_.data()
          };
        }),
      );
  }

  getUserRecordsByUsername(username: string)
    : Observable<UserRecordType[]> {
    return this.firestore
      .collection('UserRecord', (ref) => ref.where('Username', '==', username))
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          console.log({ data });
          return data.map((e: any) => {
            return {
              Id: e.payload.doc.id,
              ...e.payload.doc.data()
            };
          });
        })
      );
  }

  getUserRecordByUsernameAndId(username: string, userId: string)
    : Observable<UserRecordType> {
    return this.firestore
      .collection(
        'UserRecord',
        (ref) =>
          ref.where('Username', '==', username)
            .where('VoiceItUserId', '==', userId)
            .limit(1))
      .snapshotChanges()
      .pipe(
        map((data: any) => {
          return {
            Id: data[0]?.payload.doc.id,
            ...data[0]?.payload.doc.data()
          };
        })
      );
  }

  createVoiceItUser(): Observable<CreateVoiceItUserType> {
    return this.postDataToVoiceIt<any, CreateVoiceItUserType>({}, `https://api.voiceit.io/users`);
  }

  authenticateVoiceItUser(payload: AuthenticateVoiceItUserType): Observable<AuthenticatelVoiceItUserResponseType> {
    return this.postDataToVoiceIt<AuthenticateVoiceItUserType, AuthenticatelVoiceItUserResponseType>(payload, `https://api.voiceit.io/verification/voice/byUrl`);
  }

  enrollVoiceItUser(payload: EnrollVoiceItUserType): Observable<EnrollVoiceItUserResponseType> {
    return this.postDataToVoiceIt<EnrollVoiceItUserType, EnrollVoiceItUserResponseType>(payload, `https://api.voiceit.io/enrollments/voice/byUrl`);
  }

  getVoiceItPhrases(): Observable<PhraseType[]> {
    try {
      return this.getDataFromVoiceIt<VoiceItPhraseType>(`https://api.voiceit.io/phrases/no-STT`)
        .pipe(
          map((data): PhraseType[] => data.phrases)
        );
    }
    catch (ex) {
      throw ex;
    }
  }

  private postDataToVoiceIt<T, U>(payload: T, url: string): Observable<U> {
    if (isPlatform("capacitor")) {
      return this.postDataToVoiceItNative(payload, url);
    }
    else {
      return this.postDataToVoiceItWeb(payload, url);
    }
  }

  private postDataToVoiceItWeb<T, U>(payload: T, url: string): Observable<U> {
    try {
      const headers: HttpHeaders = new HttpHeaders({
        Authorization: `Basic ${env.voiceIt.apiEncryptedToken}`,
      });
      return this.httpClient.post<U>(`https://http-cors-proxy.herokuapp.com/${url}`, payload, { headers });
    }
    catch (ex) {
      throw ex;
    }
  }

  private postDataToVoiceItNative<T, U>(payload: T, url: string)
    : Observable<U> {
    try {
      const { Http } = Plugins;
      return from(
        Http.request({
          method: 'POST',
          url,
          headers: {
            Authorization: `Basic ${env.voiceIt.apiEncryptedToken}`,
          },
          data: {
            ...payload,
          }
        })
      ).pipe(
        map((result: any): U => result.data)
      );
    }
    catch (ex) {
      throw ex;
    }
  }

  private getDataFromVoiceIt<U>(url: string): Observable<U> {
    if (isPlatform("capacitor")) {
      return this.getDataFromVoiceItNative(url);
    } else {
      return this.getDataFromVoiceItWeb(url);
    }
  }

  private getDataFromVoiceItWeb<U>(url: string): Observable<U> {
    try {
      const headers: HttpHeaders = new HttpHeaders({
        Authorization: `Basic ${env.voiceIt.apiEncryptedToken}`,
      });
      return this.httpClient.get<U>(`https://http-cors-proxy.herokuapp.com/${url}`, { headers });
    }
    catch (ex) {
      throw ex;
    }
  }

  private getDataFromVoiceItNative<U>(url: string)
    : Observable<U> {
    try {
      const { Http } = Plugins;
      return from(
        Http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Basic ${env.voiceIt.apiEncryptedToken}`,
          },
        })
      ).pipe(
        map((result: any): U => result.data)
      );
    }
    catch (ex) {
      throw ex;
    }
  }
}
