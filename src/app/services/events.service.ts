import {Injectable} from "@angular/core";
import {Events} from "ionic-angular";

export const _GLOBAL_EVENT = 'global:event';

export const _USER_LOGOUT_EVENT = 'user:logout';
export const _USER_LOGIN_EVENT = 'user:login';
export const _INVALID_AUTHENTICATION_EVENT = 'invalid:authentication';
export const _TOKEN_EXPIRED_EVENT = 'token:expired';
export const _PAGE_RIDRECT_EVENT = 'page:redirect';

@Injectable()
export class EventsService {

    constructor(public events: Events) {

    }

    sendLoggedInEvent() {
        console.log("Publishing login event");
        this.events.publish(_GLOBAL_EVENT, {type: _USER_LOGIN_EVENT, data: {}});
    }

    sendTokenExpiredEvent() {
        console.log("Publishing token expired event");
        this.events.publish(_GLOBAL_EVENT, {type: _TOKEN_EXPIRED_EVENT, data: {}});
    }

    sendInvalidAuthenticationEvent() {
        console.log("Publishing Invalid Authentication event");
        this.events.publish(_GLOBAL_EVENT, {type: _INVALID_AUTHENTICATION_EVENT, data: {}});
    }

    sendLogoutEvent() {
        console.log("Publishing logout event");
        this.events.publish(_GLOBAL_EVENT, {type: _USER_LOGOUT_EVENT, data: {}});
    }

    sendPageRedirectEvent(pageName, param = {}, isRoot = false) {
        console.log("Publishing page redirect event");
        this.events.publish(_GLOBAL_EVENT, {
            type: _PAGE_RIDRECT_EVENT,
            data: {
                page_name: pageName,
                param: param ? param : {},
                is_root: isRoot ? isRoot : false,
            }
        });
    }
}
