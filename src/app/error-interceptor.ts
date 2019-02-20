import { HttpInterceptor, HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private toastr: ToastrService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return next.handle(req).pipe(
            catchError((error: HttpErrorResponse) => {
                this.toastr.error(error.error.message);
                // console.log(error);
                return throwError(error);
            })
        );
    }
}
