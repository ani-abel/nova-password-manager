import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import Recorderx, { ENCODE_TYPE } from 'recorderx';
import { SubSink } from 'subsink';
import { HttpService } from '../services/http.service';
import { UtilLogicService } from '../services/util-logic.service';
import {
  AuthenticatelVoiceItUserResponseType,
  LocalStorageKeyType,
  PhraseType
} from 'src/app/utils/types/shared.type';
import {
  getDataFromLocalStorage,
  saveDataToLocalStorage
} from '../utils/functions/shared.function';
import { UserRecordType } from '../utils/types/shared.type';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements
  OnInit,
  OnDestroy {
  private subSink: SubSink = new SubSink();
  private recorderx: Recorderx;
  loginForm: FormGroup;
  isRecordingStopped = true;
  wavFile: Blob;
  linkToWavFile: string;
  voiceItPhrases$: Observable<PhraseType[]>;

  constructor(
    private readonly utilLogicSrv: UtilLogicService,
    private readonly httpSrv: HttpService,
    private readonly router: Router,
  ) {
    this.recorderx = new Recorderx();
  }

  async ngOnInit(): Promise<void> {
    await this.utilLogicSrv.loginAsync();

    this.initForm();
    this.voiceItPhrases$ = this.httpSrv.getVoiceItPhrases();
    // this.voiceItPhrases$ = of(
    //   [
    //     {
    //       id: 1,
    //       text: "Never forget tomorrow is a new day",
    //       contentLanguage: "en-US",
    //     }
    //   ],
    // );
  }

  private initForm(): void {
    this.loginForm = new FormGroup({
      Username: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
    });
  }

  async startRecording(): Promise<void> {
    try {
      this.isRecordingStopped = !this.isRecordingStopped;
      // start recorderx
      await this.recorderx.start();

      setTimeout(async () => {
        await this.stopRecording();
      }, 5000);
    }
    catch (ex) {
      throw ex;
    }
  }

  private async stopRecording(): Promise<void> {
    try {
      this.isRecordingStopped = !this.isRecordingStopped;
      // get wav, a Blob
      this.wavFile = this.recorderx.getRecord({
        encodeTo: ENCODE_TYPE.WAV,
        compressible: true
      });
      this.linkToWavFile = await this.utilLogicSrv.uploadFileToS3(this.wavFile);
      this.recorderx.clear();
    }
    catch (ex) {
      throw ex;
    }
  }

  async onSubmit(voiceItPhrase: string): Promise<void> {
    if (this.loginForm.invalid && !this.linkToWavFile) {
      return;
    }
    const { Username } = this.loginForm.value;
    // ? Get the userId from localStorage
    const userId = await getDataFromLocalStorage<string>(LocalStorageKeyType.VOICEIT_USER_ID);
    if (userId) {
      //? Use the result to validate the user from firebase
      this.subSink.sink =
        this.httpSrv
          .getUserRecordByUsernameAndId(Username, userId)
          .subscribe((userData: UserRecordType) => {
            if (userData?.Id) {
              //? Use it to send an auth request to VoiceIt
              this.subSink.sink =
                this.httpSrv.authenticateVoiceItUser({
                  fileUrl: this.linkToWavFile,
                  contentLanguage: "no-STT",
                  phrase: voiceItPhrase,
                  userId
                }).subscribe(async (authData: AuthenticatelVoiceItUserResponseType) => {
                  console.log({ authData });
                  const linkedPaths = this.linkToWavFile.split("/");
                  // ? Get the element in an array: [...linkedPaths].pop()
                  await this.utilLogicSrv.deleteFileFromS3([...linkedPaths].pop());
                  if (authData?.responseCode === "SUCC") {
                    // ? Save the details to localStorage
                    saveDataToLocalStorage(userData, LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);
                    this.router.navigate(["/tabs"]);
                  }
                });
            }
          });
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }

}
