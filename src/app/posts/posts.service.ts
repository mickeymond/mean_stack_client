import { Post } from './post.model';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
const BACKEND_URL = `${environment.apiUrl}/posts`;

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    constructor(
        private httpClient: HttpClient,
        private toastr: ToastrService,
        private router: Router
    ) {}

    private posts: Post[] = [];
    private postsUpdated = new Subject<{ posts: Post[], totalPosts: number }>();

    getPostsUpdatedListener() {
        return this.postsUpdated.asObservable();
    }

    getPosts(postsPerPage: number, currentPage: number) {
        const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
        this.httpClient.get<{message: string, posts: any[], postCount: number}>(`${BACKEND_URL}${queryParams}`)
        .pipe(map(data => {
            // this.toastr.success(data.message);
            return {
                posts: data.posts.map(post => {
                    const { _id, title, content, imagePath, creator } = post;
                    return { id: _id, title, content, imagePath, creator };
                }),
                totalPosts: data.postCount
            };
        }))
        .subscribe((postsData: { posts: Post[], totalPosts: number }) => {
            this.posts = postsData.posts.reverse();
            this.postsUpdated.next({ posts: [...this.posts], totalPosts: postsData.totalPosts});
        });
    }

    getPost(id: string) {
        return this.httpClient.get<{message: string, post: any}>(`${BACKEND_URL}/${id}`)
        .pipe(map(data => {
            const { _id, title, content, imagePath } = data.post;
            return { id: _id, title, content, imagePath };
        }));
    }

    addPost(title: string, content: string, image: File) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        postData.append('image', image, title);
        this.httpClient.post<{ message: string, post: any }>(BACKEND_URL, postData)
        .subscribe(data => {
            this.toastr.success(data.message);
            this.router.navigate(['/']);
        }, error => {
            this.router.navigate(['/']);
        });
    }

    updatePost(id: string, title: string, content: string, image: any) {
        const postData = new FormData();
        postData.append('title', title);
        postData.append('content', content);
        if (typeof image === 'object') {
            postData.append('image', image, title);
        }
        this.httpClient.put<{ message: string, post: any }>(`${BACKEND_URL}/${id}`, postData)
        .subscribe(data => {
            this.toastr.success(data.message);
            this.router.navigate(['/']);
        }, error => {
            this.router.navigate(['/']);
        });
    }

    deletePost(id: string) {
        return this.httpClient.delete<{ message: string, post: any }>(`${BACKEND_URL}/${id}`);
    }
}
