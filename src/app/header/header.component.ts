import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./heade.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
    userIsAuthenticated = false;
    user: { id: string, email: string };
    private authListenerSubscription: Subscription;

    constructor(private authService: AuthService) {}

    onLogout() {
        this.authService.logout();
    }

    ngOnInit() {
        this.userIsAuthenticated = this.authService.getIsAuthenticated();
        this.user = this.authService.getUser();
        this.authListenerSubscription = this.authService.getAuthStatusListener()
        .subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.user = this.authService.getUser();
        });
    }

    ngOnDestroy() {
        this.authListenerSubscription.unsubscribe();
    }
}
