import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {CommonService} from "./common-service";

export interface AuthState {
    is_logged_in: boolean;
}


@Injectable()
export class AuthService {

    apiUrl: any;

    private authSubject = new Subject<AuthState>();
    authState = this.authSubject.asObservable();

    constructor(public http: HttpClient, public commonService: CommonService) {
        this.isLoggedIn();
        this.apiUrl = commonService.environment.API_URL;
    }

    isLoggedIn() {
        if (this.commonService.getToken()) {
            this.authSubject.next(<AuthState>{is_logged_in: true});
            return true;
        }
        else {
            this.authSubject.next(<AuthState>{is_logged_in: false});
            return false;
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.isLoggedIn();
    }

    login(data) {
        return this.http.post(this.apiUrl + '/login', data, this.commonService.getOptions());
    }

    register(data) {
        return this.http.post(this.apiUrl + '/register', data, this.commonService.getOptions());
    }

    forgotPassword(email) {
        return this.http.post(this.apiUrl + '/password/email', {email: email}, this.commonService.getOptions());
    }

}
