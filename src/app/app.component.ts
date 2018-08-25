import {Component, ViewChild} from '@angular/core';
import {AlertController, Events, IonicApp, MenuController, Nav, Platform} from 'ionic-angular';
import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {HomePage} from '../pages/home/home';
import {ListPage} from '../pages/list/list';
import {AndroidPermissions} from "@ionic-native/android-permissions";
import {TabsPage} from "../pages/tabs/tabs";
import {CommonService} from "../services/common-service";
import {AuthService, AuthState} from "../services/auth-service";
import {HttpClient} from "@angular/common/http";
import {MigrationService} from "../services/migration-service";
import {NetworkProvider} from "../services/network.service";

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
    pages: Array<{ title: string, component: any }>;

    constructor(public platform: Platform,
                public statusBar: StatusBar,
                public splashScreen: SplashScreen,
                public menuCtrl: MenuController,
                public alertCtrl: AlertController,
                public migrationService: MigrationService,
                public event: Events,
                public commonService: CommonService,
                public androidPermissions: AndroidPermissions,
                public networkProvider: NetworkProvider,
                public ionicApp: IonicApp,
                public http: HttpClient,
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
            this.migrationService.run(); // running Migrations
            this.networkProvider.setConnection(); // setting network status
            this.menuCtrl.enable(true); // initial menuCtrl status
            this.registerBackEvent(); // registering page back event
            this.globalSubscriber(); // initializing global subscriber
            this.authProvider.isLoggedIn(); // setting user login
            if (this.platform.is('cordova')) {  // demanding for permission if
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
                    title: 'Exit App',
                    message: 'Are you sure to want to exit the app ?',
                    cssClass: 'confirmExit',
                    buttons: [
                        {
                            text: 'Cancel',
                            role: 'cancel',
                            handler: () => {
                            }
                        },
                        {
                            text: 'Exit',
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
            // this.menuCtrl.enable(this.is_logged_in);
            // this.setUserData();
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

        this.networkProvider.networkState.subscribe(() => {
            this.networkProvider.setConnection();
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
        // this.menuCtrl.enable(false);
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
