import {Component} from '@angular/core';
import {PopoverController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {isDefined} from 'ionic-angular/util/util';
import {view} from "../../services/views.service";

@IonicPage()
@Component({
    selector: 'page-article',
    templateUrl: 'article.html',
})
export class ArticlePage {

    //article: Article;
    article: view;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                private popoverCtrl: PopoverController) {
        this.article = this.navParams.get('article') || {};
        console.log(this.article);
    }

    //move most of this to glue module
    ionViewDidLoad() {
        //put up loading component? Loading can be very slow.
        //this.websync.getArticle(this.article.id, this.article.feedID)

        // this.glueCtrl.getArticle(this.article.id, this.article.feedID)
        // .map(jsonData => {
        //   return jsonData[0];
        // })
        // .map(articleUpdate => {
        //   return this.translator.convertArticle(this.article, articleUpdate);
        // })
        //
        // //finally, subscribe
        // .subscribe(article =>{
        //   this.article = article;
        // });
    };

    checkMediaType(url) {
        if (url.match(/(mp3|ogg|wav|aac)/gi)) {
            return "Audio"
        }
        else if (url.match(/(mp4|webm|ogg)/gi)) {
            return "Video"
        }
        else {
            return false
        }
    };

    showOptionsPopover(myEvent) {
        //console.log("Should show popover here");
        // let popover = this.popoverCtrl.create(AppearancePage, {body: this.article}, {cssClass: 'filterMenu'});
        // popover.present({
        //   ev: myEvent
        // });
        //
        // popover.onDidDismiss(data => {
        //   //console.log("articlePage popover dismissed");
        // });
    }
}
