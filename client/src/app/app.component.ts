import { Component } from '@angular/core';
import { FormService } from './form/form.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Assignment Submission Page';
  constructor(private formService: FormService) { }
}
