import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';

import {MyApp} from './app.component';
import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HttpClientModule} from "@angular/common/http";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {TabsPage} from "../pages/tabs/tabs";
import {SQLite} from "@ionic-native/sqlite";
import {AuthService} from "../services/auth-service";
import {EventsService} from "../services/events.service";
import {CommonService} from "../services/common-service";
import {MigrationService} from "../services/migration-service";
import {SqliteService} from "../services/sqlite-service";
import {NetworkProvider} from "../services/network.service";
import {Network} from "@ionic-native/network";
import {ViewsService} from "../services/views.service";
import {PipesModule} from "../pipes/pipes.module";
import {PlayerService} from "../services/player.service";
import {Media} from "@ionic-native/media";
import {MusicControls} from "@ionic-native/music-controls";

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
        PipesModule,
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
        SQLite,
        Network,
        AuthService,
        SqliteService,
        MigrationService,
        ViewsService,
        NetworkProvider,
        EventsService,
        CommonService,
        PlayerService,
        MusicControls, Media,
        {provide: ErrorHandler, useClass: IonicErrorHandler}
    ]
})
export class AppModule {
}
