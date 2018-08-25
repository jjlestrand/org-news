import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NavController} from 'ionic-angular';
import {ArticlePage} from "../article/article";
import {EventsService} from "../../services/events.service";
import {ViewsService} from "../../services/views.service";

@Component({
    selector: 'search',
    templateUrl: 'search.html'
})
export class SearchComponent {

    text: string;
    searchQuery: string = '';
    private titles: any[];
    private searchResults: string[];

    @Input() articles: any = [];
    @Output() viewSelected = new EventEmitter();

    constructor(public navCtrl: NavController,
                private viewsService: ViewsService,
                public eventsService: EventsService) {
        this.titles = [];
        this.viewsService.getViewsOffline()
            .then((res: any) => {
                this.articles = res.data;
                if (this.articles) {
                    this.articles.forEach((article, i) => {
                        if (article.title) {
                            //console.log(article);
                            this.titles.push({
                                title: article.title,
                                index: i
                            });
                        }
                    });
                }
            })
    }

    searchTitles(ev: any) {

        //reset search titles back to all titles
        this.searchResults = this.titles;

        //set val to the value of the searchbar
        let val = ev.target.value;

        //if the value is an empty string don't filter the items
        if (val && val.trim() != '') {
            this.searchResults = this.titles.filter((title) => {
                return (title.title.toLowerCase().indexOf(val.toLowerCase()) > -1);
            })
        } else {
            this.searchResults = null;
        }
    }

    viewArticle($event, article) {
        this.viewSelected.emit();
        console.log(article);
        this.eventsService.sendPageRedirectEvent('ArticlePage', {article: this.articles[article.index]});
    }
}
