import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostsListComponent } from './posts/posts-list/posts-list.component';
import { PostsCreateComponent } from './posts/posts-create/posts-create.component';
import { PostsEditComponent } from './posts/posts-edit/posts-edit.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AuthGuard } from './auth/auth.guard';

const routes: Routes = [
    { path: '', component: PostsListComponent },
    { path: 'create', component: PostsCreateComponent, canActivate: [AuthGuard] },
    { path: 'edit/:postId', component: PostsEditComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: '404', component: NotFoundComponent },
    { path: '**', redirectTo: '/404' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
    providers: [AuthGuard]
})
export class AppRoutingModule {
    //
}
