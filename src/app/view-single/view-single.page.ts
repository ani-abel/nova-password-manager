import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { Observable } from 'rxjs';
import { SubSink } from 'subsink';
import { HttpService } from '../services/http.service';
import {
  AuthRecordType,
  CustomAPIType,
  LocalStorageKeyType,
  UserRecordType
} from '../utils/types/shared.type';
import { UtilLogicService } from '../services/util-logic.service';
import { getDataFromLocalStorage, decryptData, encryptData } from '../utils/functions/shared.function';

const { Clipboard } = Plugins;

@Component({
  selector: 'app-view-single',
  templateUrl: './view-single.page.html',
  styleUrls: ['./view-single.page.scss'],
})
export class ViewSinglePage implements
  OnInit,
  OnDestroy {
  @Input() recordId: string;
  singleAuthRecord$: Observable<AuthRecordType>;
  updateSingleRecordForm: FormGroup;
  subSink: SubSink = new SubSink();
  formDataWasChanged = false;
  hashKey: string;

  constructor(
    public modalController: ModalController,
    private readonly httpSrv: HttpService,
    private readonly utilLogicSrv: UtilLogicService,
  ) { }

  async ngOnInit(): Promise<void> {
    // ? Decrypt the data using the Haskey stored in firebase
    const userData: UserRecordType = await getDataFromLocalStorage(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);

    if (userData?.HashKey) {
      this.hashKey = userData.HashKey;
    }
    this.singleAuthRecord$ = this.httpSrv.getAuthRecord(this.recordId);
    this.subSink.sink =
      this.singleAuthRecord$.subscribe((data) => {
        data.Username = decryptData(data.Username, this.hashKey);
        data.Password = decryptData(data.Password, this.hashKey);
        this.initForm(data);
      });
  }

  private initForm(payload: AuthRecordType): void {
    this.updateSingleRecordForm = new FormGroup({
      Username: new FormControl(payload.Username, Validators.required),
      Password: new FormControl(payload.Password, Validators.required)
    });
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async copyToClipboard(payload: any): Promise<void> {
    await Clipboard.write({
      string: `${payload}`,
    });
    await this.utilLogicSrv.presentToast('COPIED');
  }

  // ? Native JS implematation for clipBoard
  copyToClipBoard(inputId: string): void {
    /* Get the text field */
    const copyText: HTMLInputElement = (document.querySelector(`#${inputId}`) as HTMLInputElement);

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    document.execCommand('copy');

    /* Alert the copied text */
    alert('Copied the text: ' + copyText.value);
  }

  async onSubmit(): Promise<void> {
    if (this.updateSingleRecordForm.invalid) {
      return;
    }
    const { Username, Password } = this.updateSingleRecordForm.value;
    // ? Encrypt the data b4 sending back to firebase
    const encryptedUsername = encryptData(Username, this.hashKey);
    const encryptedPassword = encryptData(Password, this.hashKey);

    const responseData: CustomAPIType = await this.httpSrv.updateAuthRecord(this.recordId, {
      Username: encryptedUsername,
      Password: encryptedPassword
    });
    if (responseData?.Message) {
      this.utilLogicSrv.presentToast(responseData.Message);
    }
  }

  onInput(): void {
    this.formDataWasChanged = true;
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
