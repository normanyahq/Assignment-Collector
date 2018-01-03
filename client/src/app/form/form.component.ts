import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Student, Submission } from './assignment';
import { Http } from '@angular/http';
import { FormService } from './form.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {
  public submission: Submission = new Submission();
  public buttonState: boolean;
  public deadline: string;
  constructor(private formService: FormService) {
    this.addStudent();

    setInterval(() => {
      this.updateDeadline();
    }, 10000);

  }

  ngOnInit() {
    this.deadline = new Date().toLocaleString();
    this.updateDeadline();
  }

  updateDeadline() {
    this.formService.getDeadline().then(data => {
      this.deadline = data;
    });
  }

  addStudent() {
    this.submission.students.push(new Student('', ''));
  }

  removeStudent(index: number) {
    this.submission.students.splice(index, 1);
  }

  fileChange(files: any) {
    this.submission.file = files[0];
  }

  showForm() {
    console.log(JSON.stringify(this.submission.students));
  }

  onSubmit() {
    const formData = new FormData();
    formData.append('title', this.submission.title);
    formData.append('class', this.submission.className);
    formData.append('department', this.submission.department);
    formData.append('major', this.submission.major);
    formData.append('students', JSON.stringify(this.submission.students));
    formData.append('file', this.submission.file);
    this.formService
      .postData('/submit', formData)
      .subscribe(
      data => {
        if (data['error'] === false) {
          alert('Assignment has been successfully submitted.');
        } else if (data['error'] === true) {
          alert(`Error occurred: ${data['message']}`);
        } else {
          alert(`Internal error occurred, please contact website adminstrator.`);
        }
      },
      error => {
        alert(error.error.message || 'Internal error occurred, please contact website administrator.');
      }
      );
  }

}
