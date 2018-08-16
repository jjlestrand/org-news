import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {view, ViewsService} from "../../services/views.service";

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {

    views: Array<view> = [];

    constructor(public navCtrl: NavController,
                private viewsProvider: ViewsService) {

    }

    ionViewWillLoad() {
        this.viewsProvider.getViews()
            .then((res: any) => {
                this.views = res;
                console.log('this.views', this.views);
            })
    }

}
