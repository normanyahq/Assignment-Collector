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
  title = '作业提交页面';
  @ViewChild(AdminComponent) adminComponent: AdminComponent;

  constructor(private formService: FormService) { }

  tabChange(event: MatTabChangeEvent) {
    if (event.tab.textLabel === `教师面板`) {
      this.adminComponent.activatePage();
    }
  }
}
