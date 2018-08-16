import {Injectable} from '@angular/core';
import 'rxjs/add/operator/map';
import {Platform} from 'ionic-angular';

declare var navigator: any;

import {Network} from '@ionic-native/network';
import {Subject} from 'rxjs/Subject';
import {HttpClient} from "@angular/common/http";

export interface NetworkState {
    status: boolean;
}


@Injectable()
export class NetworkProvider {

    private networkSubject = new Subject<NetworkState>();
    public networkState = this.networkSubject.asObservable();
    public network: any;
    public platform: any;

    constructor(public http: HttpClient, network: Network, platform: Platform) {
        this.network = network;
        this.platform = platform;
    }

    setConnection() {
        localStorage.setItem('current_mode', this.checkConnection() ? 'online' : 'offline');
    }

    platFormReady() {
        return new Promise((resolve, reject) => {
            this.platform.ready().then(() => {
                if (this.platform.is('cordova')) {
                    resolve({platform_ready: true, cordova: true});
                } else {
                    resolve({platform_ready: true, cordova: false});
                }
            });
        });
    }

    networkAvailable() {

        this.network.onDisconnect().subscribe(() => {
            this.networkSubject.next(<NetworkState>{status: this.checkConnection()});
        });

        this.network.onchange().subscribe(() => {
            this.networkSubject.next(<NetworkState>{status: this.checkConnection()});
        });

    }

    currentNetworkState() {
        this.networkSubject.next(<NetworkState>{status: this.checkConnection()});
    }

    getAllNetworkState() {
        let states = {};
        states['ethernet'] = true;
        states['wifi'] = true;
        states['2g'] = true;
        states['3g'] = true;
        states['4g'] = true;
        states['lte'] = true;
        states['gprs'] = true;
        states['mobile'] = true;
        states['cdma'] = true;
        states['cellular'] = true;
        states['unknown'] = false;
        states['none'] = false;
        return states;
    }

    checkConnection() {
        if (this.platform.is('cordova')) {
            if (navigator && navigator.connection) {
                let networkState = navigator.connection.type;
                let states = this.getAllNetworkState();
                return states[networkState];
            } else {
                return false;
            }
        } else {
            return true;
        }
    }

}
