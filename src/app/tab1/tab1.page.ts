import { Component } from '@angular/core';
import { ModalController, IonSearchbar } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { SubSink } from 'subsink';
import { HttpService } from '../services/http.service';
import { AuthRecordType, UserRecordType, LocalStorageKeyType } from '../utils/types/shared.type';
import { getDataFromLocalStorage } from '../utils/functions/shared.function';
import { ViewSinglePage } from '../view-single/view-single.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
  allRecords$: Observable<AuthRecordType[]>;
  subSink: SubSink = new SubSink();
  userId: string = 'Thisisreal';

  constructor(
    public modalController: ModalController,
    private readonly httpSrv: HttpService,
  ) { }

  async ngOnInit(): Promise<void> {
    const userData: UserRecordType = await getDataFromLocalStorage(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA);
    if (userData?.Id) {
      this.userId = userData.Id;
    }
    this.allRecords$ = this.httpSrv.getAuthRecordsByUserId(this.userId);
  }

  async openSingleRecord(recordId: string): Promise<void> {
    const modal = await this.modalController.create({
      component: ViewSinglePage,
      cssClass: 'my-custom-class',
      componentProps: {
        recordId,
      }
    });
    return await modal.present();
  }

  onSearch(searchField: IonSearchbar): void {
    const searchTerm: string = searchField.value;
    this.handleSearch(searchTerm);
  }

  private handleSearch(searchTerm: string): void {
    if (searchTerm.length > 1) {
      this.subSink.sink =
        this.allRecords$.subscribe((data) => {
          const searchResults: AuthRecordType[] = [];
          const regExp = new RegExp(`.*${searchTerm}.*`, 'ig');
          for (const record of data) {
            if (regExp.test(record.Label)) {
              searchResults.push(record);
            }
          }
          if (searchResults?.length > 0) {
            this.allRecords$ = of(searchResults);
          }
          else {
            this.allRecords$ = this.httpSrv.getAuthRecordsByUserId(this.userId);
          }
        });
    }
    else {
      this.allRecords$ = this.httpSrv.getAuthRecordsByUserId(this.userId);
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
