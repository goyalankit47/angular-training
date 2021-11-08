import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { UtilityService } from "./shared/utility.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private utilityService: UtilityService, private router: Router) {}
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | Promise<boolean> {
    return this.utilityService.checkIfUserAuthenticated();
  }
}
