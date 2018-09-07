import {Injectable} from "@angular/core";
import * as moment from 'moment';
import {ViewsService} from "./views.service";

export interface UrlConfig {
    url: string;
    purge_time_day: number;
}

const urlConfig: UrlConfig = {
    url: '',
    purge_time_day: 30
};

@Injectable()
export class AppConfigService {

    urlData: any;

    constructor(private viewsService: ViewsService) {
        this.urlData = JSON.parse(localStorage.getItem('urldata'));

        // if no urlData exist and and urlData mismatch with localStorage data
        if (!this.urlData || (JSON.stringify(this.urlData).toLowerCase() != JSON.stringify(urlConfig).toLowerCase())) {
            localStorage.setItem('urldata', JSON.stringify(urlConfig)); // store new urlData to localStorage
            this.viewsService.removeAllView(); // remove all views
            localStorage.setItem('last_purge_date', new Date().toString()); // set new last purge date
        } else {
            // if url Data exists in localStorage
            let last_purge_date = localStorage.getItem('last_purge_date') || '';
            if (!last_purge_date) {
                localStorage.setItem('last_purge_date', new Date().toString());
            } else {
                let isTimeToPurge = moment(new Date()).diff(moment(last_purge_date ? last_purge_date : new Date()), 'days') >= this.urlData.purge_time_day;
                if (isTimeToPurge) {
                    this.viewsService.removeAllView();
                    localStorage.setItem('last_purge_date', new Date().toString());
                }
            }
        }
    }
}