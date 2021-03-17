import { Component, OnDestroy } from '@angular/core';
import { isPlatform, Platform } from '@ionic/angular';
import { timer, fromEvent } from 'rxjs';
import { SubSink } from 'subsink';
import { UtilLogicService } from '../services/util-logic.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage implements OnDestroy {
  private subSink: SubSink = new SubSink();

  constructor(
    private readonly platForm: Platform,
    private readonly utilLogicSrv: UtilLogicService,
  ) {
    if (isPlatform("capacitor")) {
      // ? Hook runs b4 app is closed
      // window.addEventListener("beforeunload", () => {
      //   console.log({ message: "App was closed" });
      //   this.utilLogicSrv.logout();
      // });

      // ? Hook runs b4 app is closed
      this.subSink.sink =
        fromEvent(window, "beforeunload").subscribe(() => {
          console.log({ message: "App was closed" });
          this.utilLogicSrv.logout();
        });

      this.subSink.sink =
        this.platForm.resume.subscribe(() => {
          console.log({ message: "App was restarted from background" });
          this.utilLogicSrv.presentToast("Please login again");
          this.utilLogicSrv.logout();
        });

      // ? Logout user for safety reasons if they exceed x minutes in the auth section
      this.subSink.sink =
        timer((60000 * 10)).subscribe(() => {
          this.utilLogicSrv.presentToast("Please login again");
          this.utilLogicSrv.logout();
        });
    }
  }

  ngOnDestroy(): void {
    this.subSink.unsubscribe();
  }
}
