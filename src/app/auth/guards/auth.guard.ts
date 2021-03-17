import { Injectable } from "@angular/core";
import { getDataFromLocalStorage } from '../../utils/functions/shared.function';
import {
  LocalStorageKeyType,
  UserRecordType
} from '../../utils/types/shared.type';
import { UtilLogicService } from '../../services/util-logic.service';
import {
  CanActivate,
  CanActivateChild,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

@Injectable({
  providedIn: "root"
})
export class AuthGuard implements
  CanActivate,
  CanActivateChild {
  constructor(
    private readonly utilLogicSrv: UtilLogicService
  ) { }

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot)
    : Promise<boolean> {
    return await this.handleRouteActivation();
  }

  async canActivateChild(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot)
    : Promise<boolean> {
    return await this.handleRouteActivation();
  }

  private async handleRouteActivation(): Promise<boolean> {
    const userDetail: UserRecordType = await getDataFromLocalStorage(LocalStorageKeyType.VOICE_AUTHENTICATED_USER_DATA)
    if (userDetail?.VoiceItUserId) {
      return true;
    } else {
      this.utilLogicSrv.logout();
      return false;
    }
  }

}
