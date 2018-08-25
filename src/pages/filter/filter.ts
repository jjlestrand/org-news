import {Component, EventEmitter, Output} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';
import {ViewsService} from "../../services/views.service";

@IonicPage()
@Component({
    selector: 'page-filter',
    templateUrl: 'filter.html',
})
export class FilterPage {
    articles = [];
    channels = [];

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public viewsService: ViewsService,
                public viewCtrl: ViewController) {
        this.viewsService.getViewsOffline()
            .then((res: any) => {
                this.articles = res.data;
                if (this.articles) {
                    this.articles.forEach(article => {
                        if (article.field_channel && this.channels.indexOf(article.field_channel) == -1) {
                            this.channels.push(article.field_channel);
                        }
                    });
                }
            });
    }

    ionViewDidLoad() {
        //console.log('ionViewDidLoad FilterPage');
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    dismiss(action, item) {
        this.viewCtrl.dismiss({action: action, item: item});
    }

    viewSelected() {
        this.viewCtrl.dismiss({});
    }
} 
