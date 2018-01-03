import { Component } from '@angular/core';
import { FormService } from './form/form.service';
import { AdminComponent } from './admin/admin.component';
import { AfterViewInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Assignment Submission Page';
  @ViewChild(AdminComponent) adminComponent: AdminComponent;

  constructor(private formService: FormService) { }

  tabChange(event: MatTabChangeEvent) {
    if (event.tab.textLabel === `Teacher's Panel`) {
      this.adminComponent.activatePage();
    }
  }
}
