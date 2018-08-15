import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {CommonService} from "./services/common-service";
import {HttpClientModule} from "@angular/common/http";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {AuthService} from "./services/auth-service";
import {EventsService} from "./services/events.service";
import {TabsPage} from "../pages/tabs/tabs";

@NgModule({
    declarations: [
        MyApp,
        HomePage,
        ListPage,
        TabsPage
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        HttpClientModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        HomePage,
        ListPage,
        TabsPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        AndroidPermissions,
        AuthService,
        EventsService,
        CommonService,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
