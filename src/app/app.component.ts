import {Component, ViewChild} from '@angular/core';
import {AlertController, Events, IonicApp, MenuController, Nav, Platform, Tabs} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';

import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';
import {AuthService, AuthState} from "./services/auth-service";
import {CommonService} from "./services/common-service";
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {TabsPage} from "../pages/tabs/tabs";

interface GlobalEventPayload {
    type: string; // redirect, authorization,
    data: any;
}

@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    subscription: any;
    is_logged_in: any;
    user: any;
    rootPage: any = TabsPage;
    pages: Array<{ title: string, component: any }>

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                public menuCtrl: MenuController,
                public alertCtrl: AlertController,
                public event: Events,
                public commonService: CommonService,
                public androidPermissions: AndroidPermissions,
                public ionicApp: IonicApp,
                public authProvider: AuthService) {
        this.initializeApp();

        // used for an example of ngFor and navigation
        this.pages = [
            {title: 'Home', component: HomePage},
            {title: 'List', component: ListPage}
        ];

    }

    initializeApp() {
        this.platform.ready().then(() => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            this.menuCtrl.enable(false);
            this.registerBackEvent();
            this.globalSubscriber();
            this.authProvider.isLoggedIn();
            if (this.platform.is('cordova')) {
                setTimeout(() => {
                    this.getListOfPermission();
                }, 1000);
            }
        });
    }

    registerBackEvent() {
        this.platform.registerBackButtonAction(() => {
            let activePortal = this.ionicApp._loadingPortal.getActive() ||
                this.ionicApp._modalPortal.getActive() ||
                this.ionicApp._toastPortal.getActive() ||
                this.ionicApp._overlayPortal.getActive();

            if (activePortal) {
                activePortal.dismiss();
                return;
            }

            let view = this.nav.getActive();
            let page = view ? this.nav.getActive().instance : null;
            if (this.nav.canGoBack() || view && view.isOverlay) {
                this.nav.pop();

            }
            else if (page) {
                const alert = this.alertCtrl.create({
                    title: 'Sluiten',
                    message: 'Weet je zeker dat je wilt afsluiten ?',
                    cssClass: 'confirmExit',
                    buttons: [
                        {
                            text: 'Annuleer',
                            role: 'cancel',
                            handler: () => {
                            }
                        },
                        {
                            text: 'Sluiten',
                            handler: () => {
                                this.platform.exitApp(); //Exit from app
                            }
                        }
                    ]
                });
                alert.present();
            }
            else {
            }
        }, 1);
    }

    globalSubscriber() {
        this.subscription = this.authProvider.authState.subscribe((state: AuthState) => {
            this.is_logged_in = state.is_logged_in;
            this.menuCtrl.enable(this.is_logged_in);
            this.setUserData();
            // this.rootPage = this.is_logged_in ? HomePage : LoginPage;
        }, (err) => {
            console.log('err', err)
        });

        this.event.subscribe('global:event', (payload: GlobalEventPayload) => {
            console.log('gloab cathed', payload);
            this.commonService.stopLoader();
            if (payload.type == 'user:logout') {
                console.log('user:logout event cathed.!');
            } else if (payload.type == 'token:expired') {
                console.log('token:expired event catched.!');
                this.logout();
            } else if (payload.type == 'invalid:authentication') {
                console.log('invalid:authentication event catched.!');
                this.logout();
            } else if (payload.type == 'page:redirect') {
                console.log('page:redirect event catched.!', payload.data);
                this.redirect(payload.data.page_name, payload.data.param, payload.data.is_root);
            }
        });
    }

    setUserData() {
        let data: any = localStorage.getItem('userData');
        if (data) {
            data = JSON.parse(data);
            this.user = data;
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    getListOfPermission() {

        const list_permissions = [
            this.androidPermissions.PERMISSION.CAMERA,
            this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE,
            this.androidPermissions.PERMISSION.WRITE_EXTERNAL_STORAGE
        ];


        for (let i = 0; i < list_permissions.length; i++) {
            this.androidPermissions.checkPermission(list_permissions[i]).then((status) => {
                if (status.hasPermission) {
                }
                else {
                    this.androidPermissions.requestPermission(list_permissions[i]).then((result) => {

                    });
                }
            });
        }

    }

    openPage(page) {
        this.nav.setRoot(page.component);
        //this.commonService.redirect(page.component, null, true);
    }

    logout() {
        // this.nav.setRoot('LoginPage');
        this.menuCtrl.enable(false);
        this.authProvider.logout();
    }

    redirect(name, params = {}, isRoot = false) {
        console.log('redirect to name', name, params, isRoot);
        if (isRoot) {
            this.nav.setRoot(name, params);
        } else {
            this.nav.push(name, params);
        }
    }
}
