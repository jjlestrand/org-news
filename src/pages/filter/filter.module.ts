import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FilterPage} from './filter';
import {SearchComponent} from "../search/search";

@NgModule({
    declarations: [
        FilterPage,
        SearchComponent
    ],
    imports: [
        IonicPageModule.forChild(FilterPage),
    ],
    entryComponents: [FilterPage, SearchComponent]
})
export class FilterPageModule {
}
