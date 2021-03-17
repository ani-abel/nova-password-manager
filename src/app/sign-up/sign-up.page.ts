import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import Recorderx, { ENCODE_TYPE } from 'recorderx';
import { SubSink } from "subsink";
import { Observable } from 'rxjs';
import { UtilLogicService } from '../services/util-logic.service';
import { HttpService } from '../services/http.service';
import { LocalStorageKeyType, PhraseType } from '../utils/types/shared.type';
import {
  generateUniqueHexEncryptionKey,
  saveDataToLocalStorage
} from '../utils/functions/shared.function';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.page.html',
  styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements
  OnInit,
  OnDestroy {
  private subSink: SubSink = new SubSink();
  private voiceItUserId: string;
  private recorderx: Recorderx;
  signUpForm: FormGroup;
  isRecordingStopped = true;
  wavFile: Blob;
  linkToWavFile: string;
  voiceItPhrases$: Observable<PhraseType[]>;
  enrollmentRecords: string[] = [];
  enrollmentCount: number = 0;

  constructor(
    private readonly utilLogicSrv: UtilLogicService,
    private readonly httpSrv: HttpService
  ) {
    // !!! Don't use if they are multiple recordings
    // this.recorderx = new Recorderx();
  }

  ngOnInit(): void {
    this.initForm();
    this.voiceItPhrases$ = this.httpSrv.getVoiceItPhrases();
  }

  private initForm(): void {
    this.signUpForm = new FormGroup({
      Username: new FormControl(null, Validators.compose([
        Validators.required,
        Validators.email
      ])),
    });
  }

  async onSubmit(voiceItPhrase: string): Promise<void> {
    if (this.signUpForm.invalid) {
      return;
    }
    const { Username } = this.signUpForm.value;
    const hashKey: string = generateUniqueHexEncryptionKey();

    //? Save user details to Firebase
    const responseData =
      await this.httpSrv.addUserRecord({
        DateCreated: new Date(),
        VoiceItUserId: this.voiceItUserId,
        HashKey: hashKey,
        PathToVoiceRecording: [...this.enrollmentRecords],
        RecordedPhrase: voiceItPhrase,
        Username,
      });

    if (responseData) {
      await this.utilLogicSrv.presentToast("Registration was successful");
    }
  }

  async startRecording(voiceItPhraseText: string): Promise<void> {
    try {
      // ? Instantiate recorderX each time before starting recoring to avoid the microphone getting stuck
      this.recorderx = new Recorderx();
      this.isRecordingStopped = !this.isRecordingStopped;
      // start recorderx
      await this.recorderx.start();

      setTimeout(async () => {
        await this.stopRecording(voiceItPhraseText);
      }, 5000);
    }
    catch (ex) {
      throw ex;
    }
  }

  private async stopRecording(voiceItPhraseText: string): Promise<void> {
    try {
      this.isRecordingStopped = !this.isRecordingStopped;

      // get wav, a Blob
      this.wavFile = this.recorderx.getRecord({
        encodeTo: ENCODE_TYPE.WAV,
        compressible: true
      });
      const linkToWavFile: string = await this.utilLogicSrv.uploadFileToS3(this.wavFile);
      this.enrollmentRecords.push(linkToWavFile);
      this.recorderx.clear();

      // ?  Create and then enroll the new user
      this.enrollVoicePrint(linkToWavFile, voiceItPhraseText);
    }
    catch (ex) {
      throw ex;
    }
  }

  private enrollVoicePrint(
    linkToVoicePrint: string,
    voiceItPhrase: string
  ): void {
    if (!this.voiceItUserId) {
      console.log({ message: "Hey I didn't find any userId" })
      // ? Create a voiceIt User
      this.subSink.sink =
        this.httpSrv
          .createVoiceItUser()
          .subscribe(async (userRegistrationData) => {
            console.log({ userRegistrationData });
            if (userRegistrationData?.responseCode === "SUCC") {
              this.voiceItUserId = userRegistrationData?.userId;
              await saveDataToLocalStorage(userRegistrationData?.userId, LocalStorageKeyType.VOICEIT_USER_ID);

              // ? Register the voice Print
              this.subSink.sink =
                this.httpSrv
                  .enrollVoiceItUser({
                    contentLanguage: "no-STT",
                    fileUrl: linkToVoicePrint,
                    phrase: voiceItPhrase,
                    userId: this.voiceItUserId,
                  }).subscribe((enrollmentData) => {
                    console.log({ enrollmentData });
                    if (enrollmentData?.responseCode === "SUCC") {
                      // ? Mark this enrollment as complete
                      this.enrollmentCount += 1;
                    }
                  });
            }
          });
    }
    else {
      // ? Register the voice Print
      this.subSink.sink =
        this.httpSrv
          .enrollVoiceItUser({
            contentLanguage: "no-STT",
            fileUrl: linkToVoicePrint,
            phrase: voiceItPhrase,
            userId: this.voiceItUserId,
          }).subscribe((enrollmentData) => {
            console.log({ enrollmentData });
            if (enrollmentData?.responseCode === "SUCC") {
              // ? Mark this enrollment as complete
              this.enrollmentCount += 1;
            }
          });
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
