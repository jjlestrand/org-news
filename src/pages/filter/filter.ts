import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams, ViewController} from 'ionic-angular';

@IonicPage()
@Component({
    selector: 'page-filter',
    templateUrl: 'filter.html',
})
export class FilterPage {
    articles: any;
    channels: any;

    constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController) {
        this.articles = navParams.data.articles;

    }

    ionViewDidLoad() {
        //console.log('ionViewDidLoad FilterPage');
        this.channels = new Set();
        this.getChannels();
    }

    getChannels() {
        if (this.articles) {
            this.articles.forEach(article => {
                if (article.channel) {
                    this.channels.add(article.channel);
                }
            });
        }
    }

    cancel() {
        this.viewCtrl.dismiss();
    }

    dismiss(action, item, value) {
        this.viewCtrl.dismiss({action: action, item: item, value: value});
    }
} 
