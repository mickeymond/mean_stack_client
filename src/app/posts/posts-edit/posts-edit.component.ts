import { Component, OnInit } from '@angular/core';
import { PostsService } from '../posts.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { Post } from '../post.model';

@Component({
    selector: 'app-posts-edit',
    templateUrl: './posts-edit.component.html',
    styleUrls: ['./posts-edit.component.css']
})
export class PostsEditComponent implements OnInit {
    constructor(private postsService: PostsService,  public route: ActivatedRoute, private router: Router) {}

    private postId: string;
    post: Post;
    isLoading = false;
    title = 'Edit Post';
    uploadHasError = false;
    uploadErrorMessage = 'Image is required';
    previewImage = false;
    imageUrl: string;
    upload: any;

    ngOnInit() {
        this.isLoading = true;
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            this.postId = paramMap.get('postId');
            this.postsService.getPost(this.postId).subscribe((postToEdit: Post) => {
                this.post = postToEdit;
                this.upload = this.post.imagePath;
                this.imageUrl = this.post.imagePath;
                this.previewImage = true;
                this.isLoading = false;
            }, error => {
                this.router.navigate(['/']);
            });
        });
    }

    onImagePicked(event: Event, form: NgForm) {
        const file = (event.target as HTMLInputElement).files[0];
        const reader = new FileReader();
        reader.onloadend = (e) => {
            this.imageUrl = (reader.result as string);
            this.previewImage = true;
            this.uploadHasError = form.controls.upload.invalid;
        };
        if (file) {
            if (this.isFileValid(file.name)) {
                this.upload = file;
                reader.readAsDataURL(file);
            } else {
                this.uploadErrorMessage = 'Invalid File Uploaded';
                this.upload = null;
                this.uploadHasError = true;
                this.imageUrl = null;
                this.previewImage = false;
                form.controls.upload.reset();
            }
        }
    }

    onUpdatePost(form: NgForm) {
        this.uploadHasError = form.controls.upload.invalid;
        if (form.invalid) {
            return;
        }

        this.isLoading = true;
        this.postsService.updatePost(this.postId, form.value.title, form.value.content, this.upload);
        form.resetForm();
    }

    private isFileValid(fileName: string): boolean {
        const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        if (
            fileExtension === 'jpeg' ||
            fileExtension === 'jpg' ||
            fileExtension === 'png'
        ) {
            return true;
        } else {
            return false;
        }
    }
}
