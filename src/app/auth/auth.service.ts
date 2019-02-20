import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = `${environment.apiUrl}/user`;

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private authStatusListener = new Subject<boolean>();
    private token: string;
    private user: { id: string, email: string };
    private isAuthenticated = false;
    private tokenTimer: any;

    constructor(private httpClient: HttpClient, private router: Router) {}

    getToken() {
        return this.token;
    }

    getUser() {
        return this.user;
    }

    getIsAuthenticated() {
        return this.isAuthenticated;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = { email, password };
        return this.httpClient.post<{ message: string, user: any }>(`${BACKEND_URL}/signup`, authData);
    }

    loginUser(email: string, password: string) {
        const authData: AuthData = { email, password };
        this.httpClient.post<{ message: string, token: string, expiresIn: number, user: { id: string, email: string } }>(
            `${BACKEND_URL}/login`, authData
        )
        .subscribe(response => {
            if (response.token) {
                const expiresInDuration = response.expiresIn * 1000;
                this.setAuthTimer(expiresInDuration);
                this.token = response.token;
                this.isAuthenticated = true;
                this.user = response.user;
                this.authStatusListener.next(this.isAuthenticated);
                const now = new Date();
                const expirationDate = new Date(now.getTime() + (expiresInDuration));
                // console.log(expirationDate);
                this.saveAuthData(this.token, expirationDate, this.user);
                this.router.navigate(['/']);
            }
        }, error => {
            this.router.navigate(['/']);
        });
    }

    private setAuthTimer(duration: number) {
        console.log('Setting Timer: ' + duration / 1000);
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration);
    }

    autoAuthUser() {
        const authData = this.getAuthData();
        if (!authData) {
            return;
        }
        this.httpClient.get<{ message: string, user: any }>(`${BACKEND_URL}/${authData.user.id}`).subscribe(
            response => {
                if (response.user) {
                    const now = new Date();
                    const expiresIn = authData.expirationDate.getTime() - now.getTime();
                    if (expiresIn > 0) {
                        this.token = authData.token;
                        this.isAuthenticated = true;
                        this.user = authData.user;
                        this.setAuthTimer(expiresIn);
                        this.authStatusListener.next(this.isAuthenticated);
                    }
                } else {
                    this.clearAuthData();
                    this.router.navigate(['/signup']);
                }
        }, error => {
            this.clearAuthData();
            this.router.navigate(['/']);
        });
    }

    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        this.authStatusListener.next(this.isAuthenticated);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/']);
    }

    private saveAuthData(token: string, expirationDate: Date, user: { id: string, email: string }) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userData');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expiration = localStorage.getItem('expiration');
        const userData = localStorage.getItem('userData');
        if (!token || !expiration || !userData) {
            return;
        }
        return { token, expirationDate: new Date(expiration), user: JSON.parse(userData) };
    }
}
