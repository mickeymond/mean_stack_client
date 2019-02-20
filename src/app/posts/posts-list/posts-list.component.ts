import { Component, OnInit, OnDestroy } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material';
import { AuthService } from 'src/app/auth/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-posts-list',
    templateUrl: './posts-list.component.html',
    styleUrls: ['./posts-list.component.css']
})
export class PostsListComponent implements OnInit, OnDestroy {
    userIsAuthenticated = false;
    user: { id: string, email: string };
    private authStatusSubscription: Subscription;
    posts: Post[] = [];
    private postsSubscription: Subscription;
    isLoading = false;
    totalPosts = 10;
    postsPerPage = 5;
    currentPage = 0;
    pageSizeOptions = [1, 2, 5, 10];

    constructor(private postsService: PostsService, private authService: AuthService, private toastr: ToastrService) {}

    ngOnInit() {
        this.isLoading = true;

        this.userIsAuthenticated = this.authService.getIsAuthenticated();
        this.user = this.authService.getUser();
        this.authStatusSubscription = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
            this.userIsAuthenticated = isAuthenticated;
            this.user = this.authService.getUser();
        });

        this.postsService.getPosts(this.postsPerPage, this.currentPage);
        this.postsSubscription = this.postsService.getPostsUpdatedListener()
            .subscribe((postsData: { posts: Post[], totalPosts: number }) => {
                this.posts = postsData.posts;
                this.totalPosts = postsData.totalPosts;
                this.isLoading = false;
            });
    }

    onChangePage(pageData: PageEvent) {
        this.currentPage = pageData.pageIndex;
        this.postsPerPage = pageData.pageSize;
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
    }

    ngOnDestroy() {
        this.postsSubscription.unsubscribe();
        this.authStatusSubscription.unsubscribe();
    }

    onDelete(id: string) {
        this.isLoading = true;
        this.postsService.deletePost(id).subscribe(data => {
            this.toastr.success(data.message);
            this.postsService.getPosts(this.postsPerPage, this.currentPage);
        }, error => {
            this.isLoading = false;
        });
    }
}
