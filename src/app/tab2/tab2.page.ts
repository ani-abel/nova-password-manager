import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { HttpService } from '../services/http.service';
import { UtilLogicService } from '../services/util-logic.service';
import {
  generateUniqueHexEncryptionKey,
  encryptData,
  getDataFromLocalStorage
} from '../utils/functions/shared.function';
import {
  AuthRecordType,
  UserRecordType,
  LocalStorageKeyType
} from '../utils/types/shared.type';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  newRecordForm: FormGroup;
  userHash: string;
  // TODO: Remove default value for userId
  userId: string = 'Thisisreal';

  constructor(
    public modalController: ModalController,
    private readonly httpSrv: HttpService,
    private readonly utilLoginSrv: UtilLogicService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.initForm();
    const userData: UserRecordType = await getDataFromLocalStorage(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);
    if (userData?.HashKey) {
      const { HashKey, Id } = userData;
      this.userHash = HashKey;
      this.userId = Id
    } else {
      this.userHash = generateUniqueHexEncryptionKey();
    }
  }

  dismiss(): void {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      dismissed: true
    });
  }

  async onSubmit(): Promise<void> {
    if (this.newRecordForm.invalid) {
      return;
    }
    const { label, username, password } = this.newRecordForm.value;
    const payload: AuthRecordType = {
      Label: label,
      DateCreated: new Date(),
      Username: encryptData(username, this.userHash),
      Password: encryptData(password, this.userHash),
      UserId: this.userId
    };
    const data: string = await this.httpSrv.addAuthRecord(payload);
    if (data) {
      this.utilLoginSrv.presentToast('ADDED');
    }
  }

  private initForm(): void {
    this.newRecordForm = new FormGroup({
      label: new FormControl(null, Validators.required),
      username: new FormControl(null, Validators.required),
      password: new FormControl(null, Validators.required)
    });
  }

}
