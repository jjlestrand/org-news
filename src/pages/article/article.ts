import {Component} from '@angular/core';
import {PopoverController, IonicPage, NavController, NavParams} from 'ionic-angular';
import {view, ViewsService} from "../../services/views.service";
import {PlayerService} from "../../services/player.service";
import {Environment} from "../../environment/environment";

@IonicPage()
@Component({
    selector: 'page-article',
    templateUrl: 'article.html',
})
export class ArticlePage {

    //article: Article;
    article: view;
    domain: string;
    player = { duration: 0, playing: false };
    playerData: any;
    last_play_duration: any = 0;

    constructor(public navCtrl: NavController,
                public navParams: NavParams,
                public playerService: PlayerService,
                public viewsService: ViewsService,
                private popoverCtrl: PopoverController) {
        this.article = this.navParams.get('article') || {};
        this.domain = Environment.DOMAIN;
    }

    //move most of this to glue module
    async ionViewWillLoad() {
        this.last_play_duration = await this.viewsService.getLastPlayDuration(this.article.nid);
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

    addPlayDuration() {
        this.viewsService.setPlayDuration(this.article.nid, this.player.duration);
    }

    resetPlayDuration() {
        this.player.duration = 0;
        this.viewsService.setPlayDuration(this.article.nid, this.player.duration);
    }

    ionViewWillLeave() {
            this.playerService.stop();
        // if (this.player.playing) {
        //     this.addPlayDuration();
        // }
    }
}
