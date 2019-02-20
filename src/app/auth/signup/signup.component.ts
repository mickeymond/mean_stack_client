import { Component } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.components.css']
})
export class SignupComponent {
    constructor(private authService: AuthService, private router: Router) {}

    isLoading = false;

    onSignup(form: NgForm) {
        if (form.invalid) {
            return;
        }

        this.isLoading = true;
        this.authService.createUser(form.value.email, form.value.password)
        .subscribe(response => {
            if (response.user) {
                this.router.navigate(['/login']);
            }
        }, error => {
            this.isLoading = false;
        });
    }
}
