import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PostsService } from '../posts.service';

@Component({
    selector: 'app-posts-create',
    templateUrl: './posts-create.component.html',
    styleUrls: ['./posts-create.component.css']
})
export class PostsCreateComponent {
    title = 'Create Post';
    isLoading = false;
    uploadHasError = false;
    uploadErrorMessage = 'Image is required';
    previewImage = false;
    imageUrl: string;
    upload: any;

    constructor(public postsService: PostsService) {}


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

    onSavePost(form: NgForm) {
        this.uploadHasError = form.controls.upload.invalid;
        if (form.invalid) {
            return;
        }
        this.isLoading = true;
        this.postsService.addPost(form.value.title, form.value.content, this.upload);
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
