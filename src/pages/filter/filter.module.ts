import {NgModule} from '@angular/core';
import {IonicPageModule} from 'ionic-angular';
import {FilterPage} from './filter';

@NgModule({
    declarations: [
        FilterPage,
    ],
    imports: [
        IonicPageModule.forChild(FilterPage),
    ],
    entryComponents: [FilterPage]
})
export class FilterPageModule {
}
