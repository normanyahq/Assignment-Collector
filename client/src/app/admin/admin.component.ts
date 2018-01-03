import { Component, OnInit } from '@angular/core';
import { AdminService } from './admin.service';
import { Submission } from './admin.service';
import { MatTableDataSource, MatDatepickerInputEvent } from '@angular/material';
import { MatSnackBar } from '@angular/material';
import { FormControl } from '@angular/forms';
import { setInterval } from 'timers';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  public dataSource = new MatTableDataSource<Submission>();
  public displayedColumns = ['title', 'department', 'classname', 'major', 'students'];
  public deadline = new FormControl(new Date());
  authorized = false;

  constructor(private adminService: AdminService, public snackBar: MatSnackBar) {
  }

  updateTableData() {
    this.adminService.getSubmissions().then((submissions: Submission[]) => {
      const data: any = submissions;
      data.forEach(submission => {
        submission.students = submission.students
          .map(student => {
            return `${student.name}`;
          })
          .join(', ');
      });
      this.dataSource = new MatTableDataSource<any>(data);
      this.authorized = true;
    });
  }


  archieveAndReset() {
    if (this.deadline.value.getTime() > new Date().getTime()) {
      this.showMessage('Cannot archieve before the deadline.');
      return;
    }

    const result = confirm('Are you going to archieve everything and reset the submissions?');
    if (!result) {
      return;
    }
    this.adminService.archieveAndReset().then((message) => {
      this.showMessage(message);
    }).catch(message => {
      this.showMessage(message);
    }).then(() => {
      this.updateTableData();
      this.updateDeadline();
    });
  }

  async activatePage() {
    await this.updateTableData();
    await this.updateDeadline();

    if (this.authorized) {
      setInterval(() => {
        this.updateTableData();
        this.updateDeadline();
      }, 5000);
    }

  }

  ngOnInit() { }


  showMessage(message: string) {
    this.snackBar.open(message, 'close', {
      duration: 10000,
    });
  }

  saveDeadlineChange(event: MatDatepickerInputEvent<Date>) {
    const newDeadline = new Date(event.value.getTime() + (3600 * 24 - 1) * 1000); // until the end of the day
    this.adminService.postDeadline(newDeadline).then(() => {
      this.showMessage(`Deadline has been updated to ${newDeadline.toLocaleString()}`);
    });
  }

  updateDeadline() {
    this.adminService.getDeadline().then(newDeadline => {
      this.deadline = new FormControl(newDeadline);
    });
  }


}



