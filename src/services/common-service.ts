import {Injectable,} from '@angular/core';
import {Events, LoadingController, ToastController} from 'ionic-angular';
import {HttpClient, HttpHeaders,} from "@angular/common/http";
import {Environment} from "../environment/environment";

@Injectable()
export class CommonService {
    loader;
    options;
    environment;

    constructor(public http: HttpClient,
                public toastCtrl: ToastController,
                public loadingCtrl: LoadingController,
                public events: Events) {
        this.events = events;
        this.environment = Environment;
        console.log('Hello CommonService Provider');
    }

    getUser() {
        let user = window.localStorage.getItem('user') || '[]';
        return JSON.parse(user);
    }

    toastMessage(message, cls = '', position = 'bottom') {
        let toast = this.toastCtrl.create({
            message: message,
            duration: 3000,
            showCloseButton: false,
            dismissOnPageChange: false,
            cssClass: cls,
            position: position,
        });
        toast.present();
    }

    startLoader(content: string = 'Please Wait..') {
        this.stopLoader();
        if (this.isLoaderUndefined()) {
            this.loader = this.loadingCtrl.create({
                content: content,
                dismissOnPageChange: true,
            });
            this.loader.present();
        }
    }

    stopLoader() {
        if (!this.isLoaderUndefined()) {
            this.loader.dismiss().catch(() => {
            });
            this.loader = undefined;
        }
    }

    isOnlineMode() {
        return this.getCurrentMode() == 'online';
    }

    getCurrentMode() {
        let mode = window.localStorage.getItem('current_mode');
        if (mode) {
            if (mode == 'offline') {
                return 'offline';
                //activate online
            } else if (mode == 'online') {
                return 'online';
                //activate offline
            }
        } else {
            window.localStorage.setItem('current_mode', 'offline');
            return 'offline';
        }
    }

    isLoaderUndefined(): boolean {
        return (this.loader == null || this.loader == undefined);
    }

    getToken() {
        if (window.localStorage.getItem('token')) {
            return window.localStorage.getItem('token');
        }
        return null;
    }

    getOptions() {
        const httpOptions = {
            headers: new HttpHeaders({
                'Authorization': localStorage.getItem('token') || 'Bearer ',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            })
        };
        return httpOptions;
    }

    parentHasClass(targetEvent, className) {
        /* check if target parent has class or not */
        let result = false;
        let target = targetEvent.srcElement;
        while (target.parentElement) {
            target = target.parentElement;
            if (target.classList && target.classList.contains(className)) {
                result = true;
                break;
            }
        }
        return result;
        // return target.parentNode.classList.contains(className);
    };
}
